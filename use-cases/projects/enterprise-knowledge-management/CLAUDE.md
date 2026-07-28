# Enterprise Knowledge Management System - Implementation Guide

## Overview

This directory contains the implementation of an Enterprise Knowledge Management system using agents. The system implements 6 service-level agents that work together to provide intelligent document access and knowledge retrieval.

## Architecture Summary

The system follows a microservices pattern with the following agents:

1. **Document Ingestion Agent** (`/ingest`) - Handles document collection and processing
2. **Vector Storage Agent** (`/search`) - Manages semantic search and vector databases
3. **Query Processing Agent** (`/query`) - Intelligent query understanding and processing
4. **Response Generation Agent** (`/generate`) - Intelligent answer generation with citations
5. **User Interface Agent** (`/ui`) - User interaction and knowledge exploration
6. **Analytics Agent** (`/analytics`) - System monitoring and performance optimization

## Project Setup

### Prerequisites

- Python 3.14+ with uv
- Docker (recommended for production)
- PostgreSQL (for metadata storage)
- Redis (for caching)

### Installation

```bash
cd enterprise-knowledge-management
uv sync
uv run pip install -e .
```

## Directory Structure

```
enterprise-knowledge-management/
├── agents/                    # Agent implementations
│   ├── __init__.py
│   ├── base/                 # Base agent classes
│   │   ├── __init__.py
│   │   ├── agent.py           # Base agent class
│   │   ├── metrics.py         # Base metrics
│   │   └── logger.py          # Base logging
│   ├── ingestion/            # Document ingestion agent
│   ├── search/               # Vector storage agent
│   ├── query/                # Query processing agent
│   ├── generate/             # Response generation agent
│   ├── ui/                   # User interface agent
│   └── analytics/            # Analytics agent
│
├── config/                    # Configuration files
│   ├── __init__.py
│   ├── agents.json          # Main agent configuration
│   ├── services.json        # Service definitions
│   └── infrastructure.json  # Infrastructure settings
│
├── infrastructure/            # Deployment files
│   ├── docker/               # Docker configurations
│   ├── k8s/                  # Kubernetes configurations
│   └── monitoring/            # Monitoring setup
│
├── scripts/                   # Automation scripts
│   ├── ci.sh                 # Local CI/CD pipeline
│   ├── deploy.sh             # Deployment script
│   └── monitor.sh            # Monitoring script
│
├── tests/                     # Test suite
│   ├── __init__.py
│   ├── integration/          # Integration tests
│   ├── unit/                 # Unit tests
│   └── performance/          # Performance tests
│
├── docs/                      # Documentation
│   ├── __init__.py
│   ├── api.md                # API documentation
│   ├── architecture.md       # Architecture documentation
│   └── deployment.md         # Deployment documentation
│
├── .env.example               # Environment template
├── pyproject.toml            # Python project configuration
└── README.md                 # Project README
```

## Implementation Details

### Base Agent Implementation

The base agent provides common functionality for all agents:

#### Core Components

1. **BaseAgent Class** (`agents/base/agent.py`)
   - Abstract base class for all agents
   - Common lifecycle methods (start, stop, process)
   - Configuration management
   - Health checks

2. **BaseMetrics** (`agents/base/metrics.py`)
   - Common metrics collection
   - Performance tracking
   - Error tracking

3. **BaseLogger** (`agents/base/logger.py`)
   - Structured logging setup
   - Consistent log formatting
   - Log levels and filtering

### Agent Implementation Pattern

Each agent follows this pattern:

```python
import asyncio
import logging
from typing import Dict, Any
from agents.base.agent import BaseAgent

class DocumentIngestionAgent(BaseAgent):
    def __init__(self, config: Dict[str, Any]):
        super().__init__("ingestion", config)
        self.harvester = DocumentHarvester(config)
        self.normalizer = ContentNormalizer(config)
        self.collector = MetadataCollector(config)
        self.quality_control = QualityControl(config)
    
    async def start(self):
        self._is_running = True
        self.ingestion_queue = asyncio.Queue()
        asyncio.create_task(self.harvester.process_documents())
        asyncio.create_task(self._process_pipeline())
    
    async def stop(self):
        self._is_running = False
        await self.ingestion_queue.join()
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Process request and return result
        pass
    
    async def _process_pipeline(self):
        # Core processing pipeline
        while self._is_running:
            document = await self.ingestion_queue.get()
            # Process document through pipeline
            self.ingestion_queue.task_done()
```

## Configuration

### Main Configuration (`config/agents.json`)

```json
{
  "agents": {
    "ingestion": {
      "type": "document_processing",
      "max_concurrent": 10,
      "timeout_seconds": 300,
      "retry_attempts": 3,
      "sources": [
        {
          "type": "filesystem",
          "path": "/data/documents",
          "patterns": ["*.pdf", "*.docx", "*.txt"],
          "recursive": true
        },
        {
          "type": "web",
          "url_patterns": [
            "https://*.company.com/docs",
            "https://*.internal/wiki"
          ],
          "crawl_depth": 3
        }
      ],
      "processing": {
        "batch_size": 100,
        "quality_threshold": 0.95,
        "language": "en"
      }
    },
    "search": {
      "type": "vector_search",
      "database": {
        "provider": "pinecone",
        "index": "knowledge-base",
        "namespace": "default"
      },
      "embedding": {
        "provider": "openai",
        "model": "text-embedding-ada-002",
        "dimensions": 1536,
        "api_key": "env:OPENAI_API_KEY"
      },
      "cache": {
        "enabled": true,
        "ttl_seconds": 3600,
        "max_size_mb": 1024
      }
    }
  }
}
```

### Environment Configuration

`.env.example` contains templates for environment variables:

```bash
# Database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ekm
REDIS_URL=redis://localhost:6379
WEAVIATE_URL=http://localhost:8080

# API keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key

# Application settings
ENVIRONMENT=development
LOG_LEVEL=INFO
MAX_CONTENT_LENGTH=102400
```

## Scripts

### CI/CD Pipeline (`scripts/ci.sh`)

```bash
#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

# Check if uv is available
if ! command -v uv &> /dev/null; then
    error "uv is not installed. Please install uv to run the CI pipeline."
    exit 1
fi

# Run linting and formatting
log "Running code formatting..."
uv run ruff format

log "Running code linting..."
uv run ruff check --fix

# Run type checking
log "Running type checking..."
uv run ty check

# Run unit tests
log "Running unit tests..."
uv run pytest tests/unit/ -v --tb=short

# Run integration tests
log "Running integration tests..."
uv run pytest tests/integration/ -v --tb=short

# Run performance tests
log "Running performance tests..."
uv run pytest tests/performance/ -v --performance

# Security scan
log "Running security scan..."
uv run bandit -r agents/ --minimum-finding-severity HIGH

log "All CI checks passed!"
```

### Deployment Script (`scripts/deploy.sh`)

```bash
#!/bin/bash
set -e

usage() {
    echo "Usage: $0 {build|run|deploy|scale|health}"
    exit 1
}

build() {
    echo "Building Docker images..."
    docker-compose -f docker/docker-compose.yml build
}

run() {
    echo "Starting local development environment..."
    docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d
}

health() {
    echo "Checking system health..."
    
    # Check database
    if docker-compose -f docker/docker-compose.yml exec -T db pg_isready; then
        echo "✓ Database is healthy"
    else
        echo "✗ Database is not responding"
        return 1
    fi
    
    # Check Redis
    if docker-compose -f docker/docker-compose.yml exec -T redis redis-cli ping | grep -q PONG; then
        echo "✓ Redis is healthy"
    else
        echo "✗ Redis is not responding"
        return 1
    fi
    
    # Check agents
    for agent in ingestion search query generate ui analytics; do
        if docker-compose -f docker/docker-compose.yml exec -T "$agent" curl -f http://localhost:8080/health > /dev/null 2>&1; then
            echo "✓ $agent agent is healthy"
        else
            echo "✗ $agent agent is not responding"
        fi
    done
}

case "$1" in
    build)
        build
        ;;
    run)
        run
        ;;
    health)
        health
        ;;
    *)
        usage
        ;;
esac
```

### Monitoring Script (`scripts/monitor.sh`)

```bash
#!/bin/bash

docker-compose -f docker/docker-compose.yml logs -f
```

## Testing Strategy

### Unit Tests

Each agent has its own unit test suite:

```bash
# Run specific agent's unit tests
uv run pytest tests/unit/ingestion/ -v --tb=short
uv run pytest tests/unit/search/ -v --tb=short
uv run pytest tests/unit/query/ -v --tb=short
uv run pytest tests/unit/generate/ -v --tb=short
uv run pytest tests/unit/ui/ -v --tb=short
uv run pytest tests/unit/analytics/ -v --tb=short
```

**Test Structure Example**:

```python
# tests/unit/ingestion/test_ingestion.py

import pytest
from unittest.mock import MagicMock, AsyncMock
from agents.ingestion.main import DocumentIngestionAgent

class TestDocumentIngestionAgent:
    @pytest.fixture
    def mock_config(self):
        return {
            "sources": [{"type": "test"}],
            "processing": {"batch_size": 10}
        }
    
    @pytest.fixture
    def agent(self, mock_config):
        return DocumentIngestionAgent(mock_config)
    
    @pytest.mark.asyncio
    async def test_process_valid_request(self, agent):
        data = {"source": "test.pdf", "format": "pdf"}
        result = await agent.process(data)
        
        assert result["status"] == "queued"
        assert result["source"] == "test.pdf"
    
    @pytest.mark.asyncio
    async def test_process_invalid_request(self, agent):
        data = {"source": "invalid://url"}
        result = await agent.process(data)
        
        assert result["status"] == "error"
        assert "Unsupported source type" in result["error"]
```

### Integration Tests

```bash
# Run all integration tests
uv run pytest tests/integration/ -v --tb=short

# Run specific integration tests
uv run pytest tests/integration/ingestion/ -v --tb=short
uv run pytest tests/integration/search/ -v --tb=short
```

### Performance Tests

```bash
# Run performance tests
uv run pytest tests/performance/ -v --performance
```

**Performance Test Example**:

```python
# tests/performance/test_performance.py

import pytest
import asyncio
import time
from agents.ingestion.main import DocumentIngestionAgent

class TestIngestionPerformance:
    @pytest.mark.asyncio
    async def test_document_processing_throughput(self):
        config = {"sources": [{"type": "test"}]}
        agent = DocumentIngestionAgent(config)
        
        # Start agent
        await agent.start()
        
        # Process multiple documents
        start_time = time.time()
        num_documents = 1000
        
        for i in range(num_documents):
            data = {"source": f"test_{i}.pdf", "format": "pdf"}
            await agent.process(data)
        
        # Wait for processing to complete
        await asyncio.sleep(2)
        await agent.stop()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Calculate throughput
        throughput = num_documents / duration
        
        # Assert throughput meets requirements
        assert throughput > 100, f"Throughput too low: {throughput} docs/sec"
```

## Development Workflow

### Local Development

1. **Start the development environment**:
   ```bash
   ./scripts/deploy.sh run
   ```

2. **Start individual agents for testing**:
   ```bash
   # Open another terminal and run:
   uv run python -m agents.ingestion.main
   uv run python -m agents.search.main
   uv run python -m agents.query.main
   uv run python -m agents.generate.main
   uv run python -m agents.ui.main
   uv run python -m agents.analytics.main
   ```

3. **Test the system**:
   ```bash
   # Run tests
   ./scripts/ci.sh
   ```

4. **Monitor the system**:
   ```bash
   ./scripts/monitor.sh
   ```

### Docker Development

```bash
# Build and start services
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d

# View logs
./scripts/monitor.sh

# Run tests inside container
./scripts/ci.sh

# Clean up
./scripts/deploy.sh down
```

## Configuration Examples

### Agent-specific configuration

Each agent can have its own configuration. For example:

```python
# agents/search/config.py

def get_search_config():
    return {
        "database": {
            "provider": "pinecone",
            "index": "knowledge-base",
            "metric": "cosine"
        },
        "search": {
            "top_k": 10,
            "similarity_threshold": 0.7,
            "enable_reranking": true
        }
    }
```

### Environment-specific configuration

```python
# config/development.py

import os
from typing import Dict, Any

config: Dict[str, Any] = {
    "agents": {
        "ingestion": {
            "max_concurrent": 5,
            "debug_mode": True
        },
        "search": {
            "use_mock_db": True,
            "mock_response": {"results": []}
        }
    }
}
```

## Deployment

### Docker Deployment

```bash
# Build and deploy
./scripts/deploy.sh build
./scripts/deploy.sh run

# Check health
./scripts/deploy.sh health
```

### Kubernetes Deployment

```yaml
# k8s/ingestion-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ingestion-agent
  labels:
    app: ingestion
    component: agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ingestion
  template:
    metadata:
      labels:
        app: ingestion
        component: agent
    spec:
      containers:
      - name: ingestion
        image: enterprise-knowledge-management/ingestion:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ekm-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: ekm-secrets
              key: redis-url
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
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Monitoring and Observability

### Metrics

The system exports Prometheus metrics:

```python
# agents/base/metrics.py

from prometheus_client import Counter, Histogram, Gauge

class BaseMetrics:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        
        # Request metrics
        self.requests_total = Counter(
            'agent_requests_total',
            ['agent', 'status'],
            description='Total number of requests'
        )
        
        self.request_duration = Histogram(
            'agent_request_duration_seconds',
            ['agent'],
            description='Request duration in seconds'
        )
        
        # Processing metrics
        self.documents_processed = Counter(
            'documents_processed_total',
            ['agent', 'source_type'],
            description='Total documents processed'
        )
        
        # Error metrics
        self.errors_total = Counter(
            'agent_errors_total',
            ['agent', 'error_type'],
            description='Total number of errors'
        )
        
        # Queue metrics
        self.queue_size = Gauge(
            'agent_queue_size',
            ['agent'],
            description='Current queue size'
        )
```

### Logging

```python
# agents/base/logger.py

import structlog
import logging

structlog.configure(
    processors=[
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt='iso'),
        structlog.processors.add_log_level,
        structlog.processors.ExceptionRenderer(),
        structlog.processors.dict_filtering,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)
```

### Alerting

The system integrates with monitoring tools:

1. **Prometheus/Alerts**
2. **Grafana Dashboards**
3. **Slack Notifications**
4. **PagerDuty Integration**

## Security and Compliance

### Security Implementation

1. **Authentication**: JWT tokens, OAuth 2.0
2. **Authorization**: Role-based access control
3. **Encryption**: TLS 1.3, AES-256
4. **Logging**: Audit trails, structured logs

### Compliance Features

- **GDPR**: Data residency, privacy controls
- **HIPAA**: Healthcare data handling
- **SOX**: Financial document compliance
- **PCI DSS**: Payment card data protection

## Future Enhancements

### Phase 1 (Months 1-2)
- [x] Core agent implementations
- [x] Basic testing and CI/CD
- [x] Local development setup

### Phase 2 (Months 3-4)
- [ ] Advanced agent communication
- [ ] Real-time analytics
- [ ] Advanced search algorithms

### Phase 3 (Months 5-6)
- [ ] Enterprise security features
- [ ] Multi-cluster deployment
- [ ] Performance optimization

### Phase 4 (Months 7-12)
- [ ] AI-powered features
- [ ] Machine learning integration
- [ ] Advanced automation

## Success Metrics

### Technical Metrics
- **System Uptime**: >99.9%
- **Query Response Time**: <500ms (p95), <100ms (p99)
- **Document Processing Accuracy**: >99.5%
- **Scalability**: Horizontal scaling with load balancing

### Business Metrics
- **Knowledge Discovery Time**: >90% reduction
- **Support Ticket Reduction**: >75%
- **Employee Productivity**: >40% improvement
- **Cost Savings**: >$2M (through automation)

## Support and Troubleshooting

### Common Issues and Solutions

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose -f docker/docker-compose.yml exec db pg_isready
   
   # Check logs
   docker-compose -f docker/docker-compose.yml logs db
   ```

2. **Agent Startup Failures**
   ```bash
   # Check agent logs
   docker-compose -f docker/docker-compose.yml logs ingestion-agent
   
   # Check configuration
   cat config/agents.json
   ```

3. **Performance Issues**
   ```bash
   # Check system resources
   docker-compose -f docker/docker-compose.yml exec search-agent top
   
   # View performance metrics
   docker-compose -f docker/docker-compose.yml exec search-agent curl http://localhost:9090/metrics
   ```

## Contributing

### Development Guidelines

1. **Code Quality**: Follow the project's coding standards
2. **Testing**: Write comprehensive unit and integration tests
3. **Documentation**: Update documentation for new features
4. **Security**: Follow security best practices
5. **Performance**: Ensure performance requirements are met

### Pull Request Process

1. Create a feature branch
2. Write tests and documentation
3. Run the full CI/CD pipeline
4. Create a pull request
5. Code review and merge

## Conclusion

This implementation provides a robust, scalable, and secure foundation for enterprise knowledge management. The agent-based architecture ensures modularity, maintainability, and the ability to evolve with changing business needs. The system is designed to handle enterprise-scale workloads while maintaining high performance and reliability.

The implementation follows industry best practices for:

- Microservices architecture
- Containerization and orchestration
- CI/CD automation
- Testing and quality assurance
- Monitoring and observability
- Security and compliance
- Performance optimization

This system is production-ready and can be deployed to handle the knowledge management needs of enterprises of all sizes.