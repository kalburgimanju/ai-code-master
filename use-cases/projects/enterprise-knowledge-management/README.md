# Enterprise Knowledge Management System

## Overview

This system implements an Enterprise Knowledge Management platform using agents to enable intelligent access to organizational knowledge and documentation. The architecture follows a microservices pattern with 6 specialized agents working together to provide document ingestion, semantic search, intelligent query processing, and response generation.

## Architecture

The system is built around 6 service-level agents:

1. **Document Ingestion Agent** (`/ingest`) - Handles document collection and processing
2. **Vector Storage Agent** (`/search`) - Manages semantic search and vector databases
3. **Query Processing Agent** (`/query`) - Intelligent query understanding and processing
4. **Response Generation Agent** (`/generate`) - Intelligent answer generation with citations
5. **User Interface Agent** (`/ui`) - User interaction and knowledge exploration
6. **Analytics Agent** (`/analytics`) - System monitoring and performance optimization

## Getting Started

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

### Running the System

```bash
# Start all agents using docker-compose
./scripts/deploy.sh

# Run tests
./scripts/ci.sh --only tests

# Monitor system status
./scripts/monitor.sh
```

## Quick Start (Development Mode)

```bash
# Start each agent individually for development
uv run python -m agents.ingestion.main
uv run python -m agents.search.main
uv run python -m agents.query.main
uv run python -m agents.generate.main
uv run python -m agents.ui.main
uv run python -m agents.analytics.main
```

## Configuration

### Main Configuration (`config/agents.json`)

This file configures each agent's behavior, connections, and operational parameters.

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/ekm
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
WEAVIATE_URL=http://localhost:8080
```

## Project Structure

```
.
├── agents/
│   ├── base/                    # Base agent classes and utilities
│   ├── ingestion/               # Document ingestion agent
│   ├── search/                  # Vector storage and search agent
│   ├── query/                   # Query processing agent
│   ├── generate/                # Response generation agent
│   ├── ui/                      # User interface agent
│   └── analytics/               # Analytics and monitoring agent
│
├── config/                      # Configuration files
│   ├── agents.json             # Agent configurations
│   ├── services.json           # Service definitions
│   └── infrastructure.json     # Infrastructure settings
│
├── infrastructure/              # Deployment and infrastructure files
│   ├── docker/                 # Docker configurations
│   ├── k8s/                    # Kubernetes configurations
│   └── monitoring/              # Monitoring setup
│
├── scripts/                     # Shell scripts and automation
│   ├── ci.sh                   # Local CI/CD pipeline
│   ├── deploy.sh               # Deployment script
│   └── monitor.sh              # Monitoring script
│
├── tests/                       # Test suite
│   ├── integration/            # Integration tests
│   ├── unit/                   # Unit tests
│   └── performance/            # Performance tests
│
├── docs/                        # Documentation
│   ├── api.md                  # API documentation
│   ├── architecture.md         # Architecture documentation
│   └── deployment.md           # Deployment documentation
│
├── logs/                        # Log files (empty initially)
├── data/                        # Data storage (empty initially)
│   ├── documents/
│   ├── vectors/
│   └── metadata/
│
├── .env.example                 # Environment template
├── pyproject.toml              # Python project configuration
├── requirements.txt             # Dependencies (empty - using uv)
└── CLAUDE.md                    # Implementation instructions
```

## Development

### Running Tests

```bash
# Unit tests for all agents
uv run pytest tests/unit/ -v

# Integration tests
uv run pytest tests/integration/ -v --tb=short

# Performance tests
uv run pytest tests/performance/ -v --performance

# Custom test suite with filtering
uv run pytest tests/ --only=ingestion --skip=performance
```

### Code Quality

```bash
# Format code
uv run ruff format

# Lint code
uv run ruff check --fix

# Type checking
uv run ty check
```

### Running Agents Individually

Each agent can be run as a standalone Python module:

```python
# Example: Running ingestion agent directly
python -m agents.ingestion.main

# Example: Running search agent directly
python -m agents.search.main
```

## Development Mode

For rapid iteration and testing, you can run agents individually. Each agent has its own startup and shutdown logic.

## Docker

### Local Development

```bash
# Start services with docker-compose
docker-compose up -d

# Build and run all services
./scripts/deploy.sh build-and-run

# View logs
./scripts/monitor.sh
```

### Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh deploy

# Scale services
./scripts/deploy.sh scale ingestion=3 search=2 query=2 generate=1 ui=1 analytics=1

# Rollback
./scripts/deploy.sh rollback
```

## Monitoring and Observability

### Metrics

The system provides comprehensive metrics:

- **Query response time** (p95, p99 percentiles)
- **Document processing throughput** (documents/second)
- **System resource utilization** (CPU, memory, disk)
- **User engagement** (sessions, queries, satisfaction)
- **Error rates** (per agent, per operation)

### Logs

Structured logs are generated for each agent with the following information:

- Request/response logs with timing
- Error and exception details
- Performance metrics
- Audit trails for security compliance

### Alerting

The system integrates with monitoring tools to provide alerts:

- **Critical errors**: Agent crashes, system failures
- **Performance degradation**: High latency, throughput issues
- **Capacity planning**: Resource utilization trends
- **Security threats**: Unauthorized access attempts

## Security and Compliance

### Authentication and Authorization

- **API Authentication**: JWT tokens with role-based access control
- **Service-to-service authentication**: Mutual TLS
- **Session management**: Secure, expires sessions

### Encryption

- **Data at rest**: AES-256 encryption
- **Data in transit**: TLS 1.3
- **Database encryption**: Encrypted connections

### Compliance

- **GDPR**: Data residency controls, privacy by design
- **HIPAA**: Healthcare data handling procedures
- **SOX**: Financial document compliance
- **PCI DSS**: Payment card data protection

## Future Roadmap

### Phase 1 (Months 1-2)
- [x] Core ingestion and search functionality
- [x] Basic chat interface
- [x] Monitoring and logging

### Phase 2 (Months 3-4)
- [ ] Advanced natural language understanding
- [ ] Conversation management with context
- [ ] Advanced search with filtering
- [ ] Performance optimization

### Phase 3 (Months 5-6)
- [ ] Enterprise security and compliance
- [ ] High availability setup
- [ ] Advanced analytics and insights
- [ ] Disaster recovery

### Phase 4 (Months 7-12)
- [ ] AI-powered features and automation
- [ ] Machine learning models
- [ ] Continuous improvement
- [ ] New capabilities and integrations

## Success Metrics

### Technical Metrics
- **System Uptime**: >99.9% (monitored by health checks)
- **Query Response Time**: <500ms (p95), <100ms (p99)
- **Document Processing Accuracy**: >99.5%
- **User Satisfaction**: >90% (survey-based)

### Business Metrics
- **Knowledge Discovery Time**: >90% reduction
- **Support Ticket Reduction**: >75%
- **Employee Productivity**: >40% improvement
- **Annual Cost Savings**: >$2M (through automation)

## Contributing

### Development Guidelines

1. **Follow the Code of Conduct**
2. **Write clear, maintainable code**
3. **Add comprehensive tests**
4. **Update documentation**
5. **Follow the project's coding style**

### Testing

We value thorough testing. Please ensure:

- All new code has unit tests
- Integration tests cover end-to-end scenarios
- Performance tests validate scalability
- Security tests validate compliance

### Pull Requests

1. Create a feature branch
2. Follow the commit message conventions
3. Ensure all tests pass
4. Update documentation if needed
5. Create a pull request with clear description

## Support

For issues, please:

1. **Check the existing issues**
2. **Search for similar problems**
3. **File a new issue** if not found
4. **Include reproduction steps**
5. **Attach logs or screenshots**

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*Version: 1.0.0*
*Created: 2026-07-26*
*Last Updated: 2026-07-26*
*Enterprise Knowledge Management System*

---

## Implementation Notes

This system implements the enterprise knowledge management architecture described in the main document. Each agent is designed to be modular, testable, and production-ready. The system can be deployed using Docker for development or Kubernetes for production, with comprehensive monitoring and observability built-in.