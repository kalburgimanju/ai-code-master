# Backend - Portfolio Site

The backend for the comprehensive portfolio site provides content management, API endpoints, and integration with book and project data.

## Overview

This Flask/FastAPI backend serves as the content management system for the portfolio site, handling:
- Book metadata and chapter content
- Project information and GitHub API integration
- Static content serving
- API documentation

## Project Structure

```
backend/
├── app.py                  # Flask/FastAPI application entry point
├── config/                # Configuration files
├── models/               # Data models and schemas
├── services/             # Business logic services
├── routes/               # API route handlers
├── templates/            # HTML templates (if needed)
├── static/               # Static assets
└── requirements.txt      # Python dependencies
```

## Core Features

### Book Content Management
- Dynamic loading of book chapters from GitHub
- Metadata extraction from README.md files
- Interactive book web app integration
- Chapter summaries and searchable content

### Project Showcase
- Project data management from template repositories
- GitHub API integration for live demonstrations
- Project filtering and categorization
- Technology stack management

### API Endpoints
- **GET /api/books** - List all books with basic metadata
- **GET /api/books/:id** - Get book details and chapters
- **GET /api/books/:id/chapters** - List book chapters
- **GET /api/projects** - List all featured projects
- **GET /api/health** - Health check endpoint

## Technology Stack

### Backend Framework
- **Framework**: Flask (Python)
- **Alternative**: FastAPI for enhanced API features
- **API Design**: REST principles
- **Data Format**: JSON for API communications

### Services and Integration
- **GitHub API**: For dynamic content loading
- **Markdown Parsing**: For book chapter processing
- **Caching**: Redis for performance optimization
- **Validation**: Pydantic for data validation

### Database
- **SQLite**: Local database for book metadata
- **PostgreSQL**: Alternative for production environments
- **Git-based Storage**: For book and project content

## Installation and Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
cd portfolio-site/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Copy .env.example to .env and configure
```

### Running the Application

```bash
# Run in development mode
python app.py

# Run with production settings
python -m flask run --host=0.0.0.0 --port=5000
```

## API Documentation

### Health Check

**GET /api/health**

```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### Books API

**GET /api/books**

Returns a list of all available books.

**GET /api/books/{id}**

Returns detailed information about a specific book.

**GET /api/books/{id}/chapters**

Returns a list of chapters for a specific book.

### Projects API

**GET /api/projects**

Returns a list of featured projects.

## Book Content Integration

### Source Repositories

The backend dynamically loads content from:

1. **AI-Agents Book**
   - Repository: `books/AI-Agents/`
   - Web App: [https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/](https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/)
   - Structure: Markdown chapters organized by parts and sections

2. **Customer Experience Automation**
   - Repository: `books/CX-Automation/`
   - Structure: Chapter-based content with summaries

### Content Processing

Books are processed through:
- **GitHub API Calls**: To fetch repository content
- **Markdown Parsing**: To extract chapter information
- **Metadata Extraction**: For book descriptions and details
- **Caching**: To reduce API calls and improve performance

## Project Showcase Integration

### Template Projects

The portfolio site integrates with several project templates:

1. **AI Product Manager Learning Platform**
   - Technology: React, FastAPI, OpenRouter API
   - Features: Resume analysis, skills assessment

2. **ATS Resume Analyzer**
   - Technology: Python, spaCy, Sentence Transformers
   - Features: Multi-format support, industry analysis

3. **Developer Portfolio Template**
   - Technology: React, TypeScript, Vite
   - Features: Responsive design, animations

### GitHub Integration

Projects are fetched via:
- GitHub API calls for repository information
- README.md parsing for project descriptions
- File system access for project assets
- Dynamic content updates

## Configuration

### Environment Variables

The backend uses the following environment variables:

```
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_REPO_OWNER=repository_owner
GITHUB_REPO_NAME=repository_name
FLASK_ENV=development
PORT=5000
HOST=0.0.0.0
```

### Configuration Files

Configuration is stored in:
- **config.yaml**: Application settings
- **.env**: Environment variables
- **requirements.txt**: Python dependencies

## Database Schema

### SQLite Tables

1. **books**
   - id (INTEGER PRIMARY KEY)
   - title (TEXT)
   - author (TEXT)
   - description (TEXT)
   - cover_image (TEXT)
   - published_date (TEXT)
   - live_demo (TEXT)

2. **chapters**
   - id (INTEGER PRIMARY KEY)
   - book_id (INTEGER FOREIGN KEY REFERENCES books(id))
   - title (TEXT)
   - content (TEXT)
   - chapter_number (INTEGER)
   - part (TEXT)

3. **projects**
   - id (INTEGER PRIMARY KEY)
   - title (TEXT)
   - description (TEXT)
   - technologies (TEXT)
   - github_url (TEXT)
   - live_url (TEXT)
   - featured (BOOLEAN)
   - template_path (TEXT)

## Security

### Authentication

The backend implements:
- **Basic Authentication**: For admin functionalities
- **API Key Management**: For secure external access
- **Rate Limiting**: To prevent abuse
- **Input Validation**: Using Pydantic models

### Data Protection

- **HTTPS**: For all API communications
- **Secure Headers**: For enhanced security
- **CORS Configuration**: For controlled cross-origin requests
- **Error Handling**: Without revealing sensitive information

## Deployment

### Local Deployment

```bash
# Build the application
python -m pip install -r requirements.txt

# Run the application
python app.py
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Production Deployment

For production deployment:
1. Use Gunicorn for WSGI server
2. Set up NGINX for reverse proxy
3. Configure SSL certificates
4. Set up monitoring and logging
5. Configure backup strategies

## Testing

### Unit Tests

The backend includes unit tests for:
- Book content parsing
- API endpoint functionality
- Database operations
- Service integrations

### Integration Tests

Integration tests cover:
- GitHub API integration
- Database connections
- External service integrations
- End-to-end workflows

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-cov

# Run unit tests
pytest

# Run integration tests
pytest tests/integration/

# Run tests with coverage
pytest --cov=.
```

## Monitoring and Observability

### Health Monitoring

The backend includes:
- **API Response Times**: Track performance
- **Error Rates**: Monitor failures
- **Resource Utilization**: Track memory and CPU
- **Log Aggregation**: Centralized logging

### Performance Metrics

- **Book Loading**: Time to fetch book content
- **Project Updates**: Time to refresh project data
- **API Response Times**: Average and p95 latencies
- **Database Query Performance**: Query optimization

### User Analytics

Track:
- Book views and engagement
- Project interactions
- Page navigation patterns
- User journey analysis

## Troubleshooting

### Common Issues

#### Book Content Not Loading
1. Check GitHub API token configuration
2. Verify network connectivity
3. Ensure repository structure is correct

#### Project Showcase Not Displaying
1. Verify GitHub repository access
2. Check project configuration files
3. Ensure project templates are up to date

#### Performance Issues
1. Check for memory leaks
2. Optimize database queries
3. Implement caching strategies

### Debugging

To enable debugging:

```bash
# Set environment variables
export FLASK_ENV=development
export DEBUG=True

# Run the application
python app.py
```

## Future Enhancements

### Planned Backend Features

1. **Real-time Updates**
   - WebSocket integration for live updates
   - Server-sent events for real-time notifications

2. **Enhanced Book Features**
   - Interactive book readers
   - Bookmarking and notes system
   - Progress tracking

3. **Advanced Project Features**
   - GitHub Actions integration
   - Automated content updates
   - Project dependency analysis

4. **Admin Dashboard**
   - Content management interface
   - Analytics and reporting
   - User management and permissions

## Legal and Compliance

### Privacy
- **Data Minimization**: Collect only necessary data
- **Transparency**: Clear privacy policy
- **User Control**: Options for data access and deletion

### Compliance
- **GDPR**: European data protection
- **CCPA**: California consumer privacy
- **Accessibility**: WCAG compliance for content

## Performance Optimization

### Caching Strategy
- **Redis**: For frequently accessed data
- **HTTP Caching**: For static assets
- **Database Query Caching**: For complex queries

### Database Optimization
- **Indexing**: For frequently accessed columns
- **Query Optimization**: For slow queries
- **Connection Pooling**: For efficient resource usage

### CDN Integration
- **GitHub Pages**: For static assets
- **CloudFront/Fastly**: For global content delivery
- **Asset Optimization**: For reduced load times

## Migration Guide

### From Previous Version

#### Upgrade from v0.9.0 to v1.0.0

1. **Database Migration**
   - Backup existing database
   - Run migration scripts
   - Update application code if needed

2. **Configuration Updates**
   - Update environment variables
   - Adjust API endpoints if changed
   - Update book and project configurations

3. **Dependencies**
   - Update Python packages
   - Update JavaScript packages (frontend)
   - Run migration scripts

#### Breaking Changes

- API endpoint paths may have changed
- Book structure may have been updated
- Project configuration format may differ

### Migration Scripts

Migration scripts are available in the `scripts/` directory:
- **db-migration.py**: Database migration scripts
- **content-sync.py**: Content synchronization scripts
- **backup.py**: Backup and restore utilities

## Conclusion

The backend provides a robust foundation for the comprehensive portfolio site, offering:

- **Dynamic Content Management**: Automatic book and project content loading
- **API Integration**: Seamless integration with GitHub and other services
- **Performance Optimization**: Efficient caching and database operations
- **Scalability**: Architecture that supports growth
- **Maintainability**: Clean code and documentation

This backend serves as the backbone for showcasing AI/ML projects and educational content, providing a foundation for continuous enhancement and future development.

---

*Built with ❤️ using Flask/FastAPI and modern web development practices.*