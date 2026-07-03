# Chapter 1: Microservices

> *"Don't build a monolith. Build a constellation of small, focused services that work together."*

## What Are Microservices?

Microservices is an architectural style that structures an application as a collection of small, autonomous services, each running in its own process and communicating through lightweight mechanisms, typically HTTP/REST APIs or message queues. Each service is organized around a specific business capability and can be developed, deployed, and scaled independently.

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway                           │
│              (Routes & Auth)                             │
└──────┬──────────┬──────────┬──────────┬────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  User    │ │  Order   │ │ Product  │ │Payment   │
│ Service  │ │ Service  │ │ Service  │ │Service   │
│ (Python) │ │ (Go)     │ │(Node.js) │ │(Java)   │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘
     │            │            │             │
     ▼            ▼            ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐  ┌─────────┐
│Users DB │ │Orders DB│ │Products │  │Payments │
│(Postgres)│ │(MongoDB)│ │DB(MySQL)│  │DB(Postgr)│
└─────────┘ └─────────┘ └─────────┘  └─────────┘
```

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | Each service does one thing well |
| **Autonomous Deployment** | Deploy any service without affecting others |
| **Technology Freedom** | Each service can use its own tech stack |
| **Decentralized Data** | Each service owns its database |
| **Fault Isolation** | Failure in one service doesn't cascade |
| **Independently Scalable** | Scale hot services without scaling everything |

## When to Use Microservices

### Good Fit ✅

- Large engineering teams (50+ developers) working on different domains
- Applications with distinct, well-bounded business capabilities
- Systems requiring different scaling profiles per component
- Organizations aiming for independent deployment pipelines
- Systems that need technology diversity

### Poor Fit ❌

- Small teams (< 10 developers)
- Early-stage products where the domain is still being discovered
- Simple CRUD applications
- Teams without strong DevOps/infrastructure capabilities
- Systems where transactional consistency across the whole domain is critical

## Decomposition Strategies

### By Business Capability

```
E-Commerce Domain
├── Catalog Service      (products, categories, search)
├── Identity Service     (users, auth, permissions)
├── Order Service        (cart, checkout, order management)
├── Payment Service      (billing, refunds, payment methods)
├── Shipping Service     (tracking, carriers, delivery)
├── Notification Service (email, SMS, push)
└── Analytics Service    (events, reports, dashboards)
```

### By Subdomain (Domain-Driven Design)

```
┌─────────────────────────────────────────────────────┐
│                   BOUNDED CONTEXTS                   │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Sales     │  │  Fulfillment │  │ Support   │  │
│  │  Context    │  │   Context    │  │ Context   │  │
│  │             │  │              │  │           │  │
│  │ - Products  │  │ - Warehouse  │  │ - Tickets │  │
│  │ - Orders    │  │ - Shipping   │  │ - Agents  │  │
│  │ - Customers │  │ - Tracking   │  │ - KB      │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
```

## Communication Patterns

### Synchronous (Request/Response)

```
┌──────────┐   HTTP/REST    ┌──────────┐
│ Service A│ ──────────────►│ Service B│
│          │◄──────────────│          │
└──────────┘   Response     └──────────┘
```

### Asynchronous (Event-Driven)

```
┌──────────┐     ┌─────────┐     ┌──────────┐
│ Service A│────►│  Kafka  │────►│ Service B│
│ (Producer)│    │ (Broker)│     │(Consumer)│
└──────────┘     └─────────┘     └──────────┘
```

### gRPC (High-Performance RPC)

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser (GetUserRequest) returns (UserResponse);
  rpc ListUsers (ListUsersRequest) returns (stream UserResponse);
}

message GetUserRequest {
  string user_id = 1;
}

message UserResponse {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

## Real-World Examples

### Netflix

Netflix runs over **1,000 microservices** powering streaming for 200M+ subscribers:

| Service | Responsibility | Tech Stack |
|---------|---------------|------------|
| Zuul | API Gateway | Java/Netflix OSS |
| Eureka | Service Discovery | Java |
| Hystrix | Circuit Breaker | Java |
| Conductor | Orchestration | Java |
| Falcor | Data Fetching | Node.js |

### Amazon

Amazon's retail platform is decomposed into hundreds of microservices, each owned by a small "two-pizza team." This architecture enables thousands of deployments per day.

## Complete Code Example: E-Commerce Microservices

### Project Structure

```
ecommerce-microservices/
├── docker-compose.yml
├── api-gateway/
│   ├── Dockerfile
│   └── src/
│       └── main.py
├── user-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       ├── main.py
│       ├── models.py
│       └── routes.py
├── order-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       ├── main.py
│       ├── models.py
│       └── routes.py
└── shared/
    └── events.py
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    depends_on:
      - user-service
      - order-service
      - product-service
    networks:
      - microservices-net

  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=postgresql://user:pass@users-db:5432/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - users-db
      - redis
    networks:
      - microservices-net

  order-service:
    build: ./order-service
    environment:
      - DATABASE_URL=postgresql://user:pass@orders-db:5432/orders
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - orders-db
      - kafka
    networks:
      - microservices-net

  product-service:
    build: ./product-service
    environment:
      - DATABASE_URL=postgresql://user:pass@products-db:5432/products
    depends_on:
      - products-db
    networks:
      - microservices-net

  # Databases
  users-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: users
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - users-data:/var/lib/postgresql/data
    networks:
      - microservices-net

  orders-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: orders
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - orders-data:/var/lib/postgresql/data
    networks:
      - microservices-net

  products-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: products
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - products-data:/var/lib/postgresql/data
    networks:
      - microservices-net

  # Message Broker
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper
    networks:
      - microservices-net

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks:
      - microservices-net

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - microservices-net

volumes:
  users-data:
  orders-data:
  products-data:

networks:
  microservices-net:
    driver: bridge
```

### API Gateway (Python/FastAPI)

```python
# api-gateway/src/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import time
import logging

app = FastAPI(title="API Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)

# Service registry
SERVICES = {
    "users": "http://user-service:8001",
    "orders": "http://order-service:8002",
    "products": "http://product-service:8003",
}

# Simple rate limiter
rate_limits: dict[str, list[float]] = {}
RATE_LIMIT = 100  # requests per minute
RATE_WINDOW = 60  # seconds


def check_rate_limit(client_id: str) -> bool:
    now = time.time()
    if client_id not in rate_limits:
        rate_limits[client_id] = []

    # Remove old entries
    rate_limits[client_id] = [
        t for t in rate_limits[client_id] if now - t < RATE_WINDOW
    ]

    if len(rate_limits[client_id]) >= RATE_LIMIT:
        return False

    rate_limits[client_id].append(now)
    return True


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_id = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return await call_next(request)


@app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(service: str, path: str, request: Request):
    if service not in SERVICES:
        raise HTTPException(status_code=404, detail=f"Service '{service}' not found")

    service_url = f"{SERVICES[service]}/{path}"
    body = await request.body()

    headers = dict(request.headers)
    headers["X-Request-ID"] = str(time.time_ns())
    headers["X-Forwarded-For"] = request.client.host if request.client else "unknown"

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.request(
                method=request.method,
                url=service_url,
                headers=headers,
                content=body if body else None,
                params=dict(request.query_params),
            )
            return response.json()
        except httpx.ConnectError:
            raise HTTPException(
                status_code=503,
                detail=f"Service '{service}' is unavailable",
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail=f"Service '{service}' timed out",
            )


@app.get("/health")
async def health_check():
    results = {}
    async with httpx.AsyncClient(timeout=5.0) as client:
        for name, url in SERVICES.items():
            try:
                resp = await client.get(f"{url}/health")
                results[name] = "healthy" if resp.status_code == 200 else "unhealthy"
            except Exception:
                results[name] = "unreachable"
    return {"status": "ok", "services": results}
```

### User Service (Python/FastAPI)

```python
# user-service/src/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import asyncpg
import redis.asyncio as redis
import os
import json

app = FastAPI(title="User Service", version="1.0.0")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/users")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

db_pool: asyncpg.Pool | None = None
redis_client: redis.Redis | None = None


class UserCreate(BaseModel):
    name: str
    email: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


@app.on_event("startup")
async def startup():
    global db_pool, redis_client
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)

    # Create table
    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)


@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()
    if redis_client:
        await redis_client.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "user-service"}


@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    user_id = str(uuid.uuid4())

    async with db_pool.acquire() as conn:
        try:
            await conn.execute(
                "INSERT INTO users (id, name, email) VALUES ($1, $2, $3)",
                user_id, user.name, user.email,
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Email already exists")

    # Cache the new user
    await redis_client.setex(
        f"user:{user_id}", 3600,
        json.dumps({"id": user_id, "name": user.name, "email": user.email}),
    )

    return UserResponse(id=user_id, name=user.name, email=user.email)


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    # Check cache first
    cached = await redis_client.get(f"user:{user_id}")
    if cached:
        return UserResponse(**json.loads(cached))

    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, email FROM users WHERE id = $1", user_id,
        )

    if not row:
        raise HTTPException(status_code=404, detail="User not found")

    user = UserResponse(id=row["id"], name=row["name"], email=row["email"])

    # Cache for 1 hour
    await redis_client.setex(f"user:{user_id}", 3600, json.dumps(user.model_dump()))

    return user


@app.get("/users")
async def list_users(limit: int = 20, offset: int = 0):
    async with db_pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, name, email FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
            limit, offset,
        )
    return [UserResponse(id=r["id"], name=r["name"], email=r["email"]) for r in rows]
```

### Order Service (Python/FastAPI)

```python
# order-service/src/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from enum import Enum
import uuid
import asyncpg
import httpx
import os
import json
import logging
from datetime import datetime, timezone

app = FastAPI(title="Order Service", version="1.0.0")
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/orders")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://user-service:8001")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://product-service:8003")

db_pool: asyncpg.Pool | None = None


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float


class OrderCreate(BaseModel):
    user_id: str
    items: list[OrderItem]


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: list[OrderItem]
    status: OrderStatus
    total: float
    created_at: str


@app.on_event("startup")
async def startup():
    global db_pool
    db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=5, max_size=20)

    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                items JSONB NOT NULL,
                status TEXT DEFAULT 'pending',
                total NUMERIC(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)


@app.on_event("shutdown")
async def shutdown():
    if db_pool:
        await db_pool.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "order-service"}


@app.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(order: OrderCreate):
    # Verify user exists via inter-service call
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            user_resp = await client.get(f"{USER_SERVICE_URL}/users/{order.user_id}")
            if user_resp.status_code == 404:
                raise HTTPException(status_code=400, detail="User not found")
        except httpx.ConnectError:
            logger.warning("User service unavailable, proceeding without verification")

    # Calculate total
    total = sum(item.price * item.quantity for item in order.items)
    order_id = str(uuid.uuid4())

    async with db_pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO orders (id, user_id, items, status, total)
               VALUES ($1, $2, $3, $4, $5)""",
            order_id,
            order.user_id,
            json.dumps([item.model_dump() for item in order.items]),
            OrderStatus.PENDING.value,
            total,
        )

    logger.info(f"Order {order_id} created for user {order.user_id}, total: {total}")

    return OrderResponse(
        id=order_id,
        user_id=order.user_id,
        items=order.items,
        status=OrderStatus.PENDING,
        total=total,
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT id, user_id, items, status, total, created_at FROM orders WHERE id = $1",
            order_id,
        )

    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    items = [OrderItem(**item) for item in row["items"]]
    return OrderResponse(
        id=row["id"],
        user_id=row["user_id"],
        items=items,
        status=OrderStatus(row["status"]),
        total=float(row["total"]),
        created_at=row["created_at"].isoformat(),
    )


@app.get("/orders/user/{user_id}")
async def get_user_orders(user_id: str):
    async with db_pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, user_id, items, status, total, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
            user_id,
        )

    return [
        OrderResponse(
            id=r["id"],
            user_id=r["user_id"],
            items=[OrderItem(**i) for i in r["items"]],
            status=OrderStatus(r["status"]),
            total=float(r["total"]),
            created_at=r["created_at"].isoformat(),
        )
        for r in rows
    ]


@app.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: OrderStatus):
    async with db_pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE orders SET status = $1 WHERE id = $2",
            status.value, order_id,
        )

    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": f"Order {order_id} status updated to {status.value}"}
```

### Product Service (TypeScript/Node.js)

```typescript
// product-service/src/index.ts
import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/products",
});

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

// Initialize database
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } finally {
    client.release();
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

// List products with Redis caching
app.get("/products", async (req, res) => {
  const cacheKey = `products:list:${req.query.category || "all"}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const { rows } = await pool.query(
    "SELECT * FROM products ORDER BY created_at DESC LIMIT 50"
  );

  await redis.setex(cacheKey, 300, JSON.stringify(rows)); // Cache for 5 minutes
  res.json(rows);
});

// Get single product
app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
  if (rows.length === 0) {
    return res.status(404).json({ detail: "Product not found" });
  }

  await redis.setex(cacheKey, 3600, JSON.stringify(rows[0]));
  res.json(rows[0]);
});

// Create product
app.post("/products", async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const id = crypto.randomUUID();

  await pool.query(
    "INSERT INTO products (id, name, description, price, stock, category) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, name, description, price, stock || 0, category]
  );

  // Invalidate list cache
  const keys = await redis.keys("products:list:*");
  if (keys.length > 0) await redis.del(...keys);

  res.status(201).json({ id, name, description, price, stock: stock || 0, category });
});

// Health check
app.get("/products/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

const PORT = process.env.PORT || 8003;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Product service running on port ${PORT}`));
  })
  .catch(console.error);
```

### Dockerfiles

```dockerfile
# user-service/Dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
EXPOSE 8001
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

```
# user-service/requirements.txt
fastapi==0.115.0
uvicorn==0.32.0
asyncpg==0.30.0
redis[hiredis]==5.2.0
httpx==0.28.0
pydantic==2.10.0
```

## Service Mesh

A service mesh provides infrastructure-level networking capabilities like load balancing, encryption, and observability without changing application code.

```
┌──────────────────────────────────────────┐
│              Service Mesh (Istio)        │
│                                          │
│  ┌──────────┐      ┌──────────┐         │
│  │ Service A│◄────►│ Service B│         │
│  │ + Envoy  │      │ + Envoy  │         │
│  │  Proxy   │      │  Proxy   │         │
│  └──────────┘      └──────────┘         │
│       │                  │               │
│       └──────┬───────────┘               │
│              │ Control Plane             │
│         ┌────┴────┐                     │
│         │ Istiod  │                     │
│         │(Config) │                     │
│         └─────────┘                     │
└──────────────────────────────────────────┘
```

| Feature | Without Service Mesh | With Service Mesh |
|---------|---------------------|-------------------|
| Load Balancing | Client-side logic | Automatic, policy-driven |
| Mutual TLS | Manual setup | Automatic encryption |
| Retries/Timeouts | In application code | Infrastructure-level |
| Observability | Custom instrumentation | Automatic metrics/traces |
| Circuit Breaking | Per-service implementation | Centralized policies |

## Pros and Cons

### Pros

| Advantage | Impact |
|-----------|--------|
| Independent deployment | Teams ship features faster with less coordination |
| Technology diversity | Use the best tool for each job |
| Fault isolation | One service crash doesn't bring down the system |
| Scalability | Scale only what needs scaling |
| Team autonomy | Small teams own entire services end-to-end |

### Cons

| Disadvantage | Mitigation |
|-------------|------------|
| Distributed system complexity | Use service mesh, observability tools |
| Network latency between services | Use gRPC, connection pooling, caching |
| Data consistency challenges | Saga pattern, eventual consistency, event sourcing |
| Operational overhead | Invest in CI/CD, monitoring, container orchestration |
| Debugging difficulty | Distributed tracing (OpenTelemetry), centralized logging |
| Testing complexity | Contract testing (Pact), integration test environments |

## Migration Strategy: Monolith to Microservices

```
Phase 1: Identify Bounded Contexts
         ┌─────────────────────────┐
         │      Monolith           │
         │ ┌─────┐ ┌─────┐ ┌────┐ │
         │ │Users│ │Orders│ │Pay │ │
         │ └──┬──┘ └──┬───┘ └─┬──┘ │
         └────┼───────┼───────┼────┘
              │       │       │
Phase 2: Extract Strangler Fig Pattern
         ┌──────────┐  ┌──────┐
         │ Users    │  │Monol.│
         │ Service  │  │(less)│
         └──────────┘  └──────┘
              │       │
Phase 3: Complete Extraction
         ┌──────────┐  ┌─────────┐  ┌──────────┐
         │ Users    │  │ Orders  │  │ Payment  │
         │ Service  │  │ Service │  │ Service  │
         └──────────┘  └─────────┘  └──────────┘
```

## Practice Exercises

1. **Build a Microservices Chat Application**: Create a chat app with separate services for messaging, user management, and notifications. Use Redis pub/sub for real-time communication.

2. **Implement Service Discovery**: Build a simple service registry that allows services to register themselves and discover other services.

3. **Deploy to Kubernetes**: Take the e-commerce example above and create Kubernetes manifests (Deployments, Services, Ingress) for deployment.

4. **Add Circuit Breaker**: Implement a circuit breaker in the API Gateway that prevents cascading failures when downstream services are down.

5. **Implement Health Checks**: Add comprehensive health checks that verify database connections, cache connectivity, and downstream service availability.

## Summary

Microservices architecture enables building complex applications as a collection of independently deployable services. While it introduces distributed system challenges, the benefits of independent scaling, team autonomy, and technology flexibility make it the preferred architecture for large-scale applications. Start with a well-understood domain decomposition, invest in infrastructure (container orchestration, service mesh, observability), and migrate gradually from a monolith using the strangler fig pattern.

**Key Takeaways:**
- Microservices are about business domain decomposition, not just splitting code
- Each service should own its data store
- Invest heavily in infrastructure and tooling before going microservices
- Start with a modular monolith and extract services only when the benefits outweigh the complexity
- Observability, resilience patterns, and automated deployment are non-negotiable
