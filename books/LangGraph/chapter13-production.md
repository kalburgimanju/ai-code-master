# Chapter 13: Production Deployment

## Deployment Architecture

```
Production LangGraph Architecture
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  App Pod 1    │ │  App Pod 2    │ │  App Pod N    │
│  (FastAPI)    │ │  (FastAPI)    │ │  (FastAPI)    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL          │
              │   (Checkpointer)      │
              └───────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       ┌─────────────┐         ┌─────────────┐
       │   Redis     │         │  Object     │
       │  (Cache/    │         │  Storage    │
       │   Queue)    │         │  (Artifacts)│
       └─────────────┘         └─────────────┘
```

---

## Containerization

### Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen

# Copy application
COPY src/ ./src/
COPY config/ ./config/

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml (Local Dev)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/langgraph
      - REDIS_URL=redis://redis:6379/0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src  # Hot reload

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=langgraph
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## FastAPI Application

### Main Application

```python
# src/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg_pool import AsyncConnectionPool

from graphs import build_research_graph, build_chat_graph
from config import settings


# Global resources
pool: AsyncConnectionPool = None
checkpointer: AsyncPostgresSaver = None
research_app = None
chat_app = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool, checkpointer, research_app, chat_app
    
    # Startup
    pool = AsyncConnectionPool(
        conninfo=settings.DATABASE_URL,
        min_size=5,
        max_size=20,
        open=True
    )
    
    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()
    
    # Compile graphs with checkpointer
    research_app = build_research_graph().compile(checkpointer=checkpointer)
    chat_app = build_chat_graph().compile(checkpointer=checkpointer)
    
    yield
    
    # Shutdown
    await pool.close()


app = FastAPI(
    title="LangGraph API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class InvokeRequest(BaseModel):
    thread_id: str
    input: dict
    config: dict = {}


class StreamRequest(BaseModel):
    thread_id: str
    input: dict
    stream_mode: str = "values"


class ResumeRequest(BaseModel):
    thread_id: str
    action: str
    payload: dict = {}


# Health Check
@app.get("/health")
async def health_check():
    # Check database
    try:
        async with pool.connection() as conn:
            await conn.execute("SELECT 1")
        db_healthy = True
    except Exception:
        db_healthy = False
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "version": "1.0.0"
    }


# Invoke Endpoint
@app.post("/invoke")
async def invoke_graph(request: InvokeRequest, graph: str = "research"):
    try:
        app_instance = research_app if graph == "research" else chat_app
        config = {"configurable": {"thread_id": request.thread_id}, **request.config}
        
        result = await app_instance.ainvoke(request.input, config)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Streaming Endpoint (SSE)
@app.post("/stream")
async def stream_graph(request: StreamRequest, graph: str = "research"):
    from fastapi.responses import StreamingResponse
    import json
    
    app_instance = research_app if graph == "research" else chat_app
    config = {"configurable": {"thread_id": request.thread_id}}
    
    async def generate():
        try:
            async for chunk in app_instance.astream(
                request.input, config, stream_mode=request.stream_mode
            ):
                yield f"data: {json.dumps(chunk)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")


# Resume Endpoint (HITL)
@app.post("/resume")
async def resume_graph(request: ResumeRequest, graph: str = "research"):
    from langgraph.types import Command
    
    app_instance = research_app if graph == "research" else chat_app
    config = {"configurable": {"thread_id": request.thread_id}}
    
    try:
        result = await app_instance.ainvoke(
            Command(resume={"action": request.action, **request.payload}),
            config
        )
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# State Inspection
@app.get("/state/{thread_id}")
async def get_state(thread_id: str, graph: str = "research"):
    app_instance = research_app if graph == "research" else chat_app
    config = {"configurable": {"thread_id": thread_id}}
    
    state = await app_instance.aget_state(config)
    return {"state": state.values if state else None}


@app.get("/history/{thread_id}")
async def get_history(thread_id: str, graph: str = "research", limit: int = 10):
    app_instance = research_app if graph == "research" else chat_app
    config = {"configurable": {"thread_id": thread_id}}
    
    history = []
    async for state in app_instance.aget_state_history(config):
        history.append({
            "checkpoint_id": state.config["configurable"]["checkpoint_id"],
            "step": state.metadata.get("step"),
            "status": state.values.get("status"),
            "timestamp": state.metadata.get("timestamp")
        })
        if len(history) >= limit:
            break
    
    return {"history": history}
```

---

## Kubernetes Deployment

### Deployment Manifest

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: langgraph-api
  labels:
    app: langgraph-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: langgraph-api
  template:
    metadata:
      labels:
        app: langgraph-api
    spec:
      containers:
      - name: api
        image: your-registry/langgraph-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: langgraph-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: langgraph-secrets
              key: redis-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: langgraph-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - langgraph-api
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: langgraph-api
spec:
  selector:
    app: langgraph-api
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: langgraph-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: langgraph-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
    scaleUp:
      stabilizationWindowSeconds: 60
```

---

## Monitoring & Observability

### Prometheus Metrics

```python
# src/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Response

# Metrics
GRAPH_INVOCATIONS = Counter(
    "langgraph_invocations_total",
    "Total graph invocations",
    ["graph", "status"]
)

GRAPH_DURATION = Histogram(
    "langgraph_duration_seconds",
    "Graph execution duration",
    ["graph"],
    buckets=[0.1, 0.5, 1, 2, 5, 10, 30, 60]
)

ACTIVE_THREADS = Gauge(
    "langgraph_active_threads",
    "Active conversation threads",
    ["graph"]
)

CHECKPOINT_SIZE = Histogram(
    "langgraph_checkpoint_size_bytes",
    "Checkpoint size in bytes",
    buckets=[100, 1000, 10000, 100000, 1000000]
)

NODE_EXECUTIONS = Counter(
    "langgraph_node_executions_total",
    "Node executions",
    ["graph", "node", "status"]
)


# Middleware for metrics
@app.middleware("http")
async def metrics_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    # Record metrics
    GRAPH_DURATION.labels(graph="api").observe(duration)
    
    return response


@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### Structured Logging

```python
# src/logging_config.py
import structlog
import logging

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Usage in nodes
def research_node(state: State) -> dict:
    logger.info("research_started", topic=state["topic"], thread_id=state.get("thread_id"))
    try:
        result = do_research(state["topic"])
        logger.info("research_completed", findings_count=len(result))
        return {"findings": [result]}
    except Exception as e:
        logger.error("research_failed", error=str(e), exc_info=True)
        raise
```

### Distributed Tracing (OpenTelemetry)

```python
# src/tracing.py
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor

# Setup
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

# Exporter
otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4317")
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(otlp_exporter))

# Auto-instrument
FastAPIInstrumentor.instrument_app(app)
Psycopg2Instrumentor().instrument()

# Custom spans in nodes
def research_node(state: State) -> dict:
    with tracer.start_as_current_span("research_node") as span:
        span.set_attribute("topic", state["topic"])
        span.set_attribute("thread_id", state.get("thread_id", "unknown"))
        
        result = do_research(state["topic"])
        
        span.set_attribute("findings_count", len(result))
        return {"findings": [result]}
```

---

## Security

### Authentication

```python
# src/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta

security = HTTPBearer()

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Protect endpoints
@app.post("/invoke")
async def invoke_graph(
    request: InvokeRequest,
    user_id: str = Depends(get_current_user),
    graph: str = "research"
):
    # Add user_id to thread for isolation
    request.thread_id = f"{user_id}:{request.thread_id}"
    # ... rest of handler
```

### Rate Limiting

```python
# src/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/invoke")
@limiter.limit("30/minute")
async def invoke_graph(request: Request, invoke_request: InvokeRequest):
    # ...
```

---

## Database Optimization

### Connection Pooling

```python
# Optimal pool settings for production
pool = AsyncConnectionPool(
    conninfo=settings.DATABASE_URL,
    min_size=10,           # Minimum connections
    max_size=50,           # Maximum connections
    max_idle=300,          # Max idle time (seconds)
    max_lifetime=3600,     # Max connection lifetime
    open=True,
    kwargs={
        "prepare_threshold": 0,  # Disable prepared statements for pgbouncer
    }
)
```

### Indexes for Checkpointer

```sql
-- Run as migration
CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_id 
ON checkpoints (thread_id);

CREATE INDEX IF NOT EXISTS idx_checkpoints_thread_ns 
ON checkpoints (thread_id, checkpoint_ns);

CREATE INDEX IF NOT EXISTS idx_checkpoints_parent 
ON checkpoints (parent_checkpoint_id);

CREATE INDEX IF NOT EXISTS idx_checkpoint_blobs_checkpoint_id 
ON checkpoint_blobs (checkpoint_id);

-- For TTL cleanup
CREATE INDEX IF NOT EXISTS idx_checkpoints_timestamp 
ON checkpoints (checkpoint_timestamp);
```

---

## Scaling Strategies

### 1. Horizontal Scaling (Stateless)

- Multiple app pods behind load balancer
- Shared PostgreSQL checkpointer
- Redis for rate limiting/cache

### 2. Graph Sharding

```python
# Route different graph types to different pools
GRAPH_POOLS = {
    "research": research_pool,
    "chat": chat_pool,
    "analysis": analysis_pool,
}

def get_pool(graph_type: str):
    return GRAPH_POOLS.get(graph_type, default_pool)
```

### 3. Async Workers for Long Tasks

```python
# src/workers.py
from celery import Celery

celery = Celery("langgraph", broker=settings.REDIS_URL)

@celery.task(bind=True, max_retries=3)
def run_long_research(self, thread_id: str, input_data: dict):
    """Run long research task in background."""
    config = {"configurable": {"thread_id": thread_id}}
    result = research_app.invoke(input_data, config)
    
    # Notify via WebSocket/push
    notify_completion(thread_id, result)
    return result
```

---

## CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install uv && uv sync --frozen
      - run: pytest --cov=src --cov-fail-under=80
      - run: ty check .
      - run: ruff check .

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ secrets.REGISTRY }}/langgraph-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: azure/k8s-set-context@v1
        with:
          kubeconfig: ${{ secrets.KUBECONFIG }}
      - run: |
          kubectl set image deployment/langgraph-api \
            api=${{ secrets.REGISTRY }}/langgraph-api:${{ github.sha }}
      - run: kubectl rollout status deployment/langgraph-api --timeout=300s
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > "backups/langgraph_$DATE.sql"
aws s3 cp "backups/langgraph_$DATE.sql" s3://my-backups/langgraph/
```

### Point-in-Time Recovery

```sql
-- Recovery to specific timestamp
-- Requires WAL archiving enabled
pg_basebackup -D /recovery -R --wal-method=stream
# Then edit recovery.signal with recovery_target_time
```

---

## Summary Checklist

| Area | Production Ready |
|------|------------------|
| ✅ Containerization | Docker + docker-compose |
| ✅ Orchestration | Kubernetes + HPA |
| ✅ Database | PostgreSQL + connection pooling |
| ✅ Checkpointing | AsyncPostgresSaver |
| ✅ Monitoring | Prometheus + Grafana |
| ✅ Logging | Structured JSON + OpenTelemetry |
| ✅ Security | JWT auth + rate limiting |
| ✅ CI/CD | GitHub Actions + K8s deploy |
| ✅ Backup | Daily pg_dump + PITR |
| ✅ Scaling | Horizontal + async workers |

---

## Next Chapter: Building Production Applications

In Chapter 14, we'll build complete production-ready applications: a research assistant, a code agent, and a customer support bot.