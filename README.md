# AI Product Manager Learning Platform

A comprehensive learning platform for AI Product Managers, featuring resume analysis, prompt engineering tools, and industry insights.

## Overview

The AI Product Manager Learning Platform is designed to help individuals develop and validate their skills as AI Product Managers. It combines technical assessment, learning modules, and practical tools to create a complete learning experience.

## Key Features

### 🎯 Resume Analysis for AI PM Roles
- AI-powered resume analysis specifically tailored for AI Product Manager positions
- 6-dimensional scoring system (technical skills, product management, AI/ML expertise, leadership, prompt engineering, industry knowledge)
- Custom improvement suggestions based on job descriptions
- Industry-specific benchmark comparisons

### 📚 Interactive Learning Modules
- **Module 1**: Foundations of AI Product Management
- **Module 2**: Technical Skills & Architecture
- **Module 3**: Prompt Engineering & LLM Integration
- **Module 4**: Product Strategy & Leadership
- **Module 5**: GTM Strategies for AI Products

### 🛠️ Advanced Tools
- **Prompt Engineering Playground**: Test, refine, and save prompts
- **AI Product Development Assistant**: Get help with product features and strategy
- **Technical Skills Assessment**: Validate your AI/ML and product management capabilities
- **Industry Insights**: Current trends, competitive analysis, and salary benchmarks

### 👥 Community Features
- Progress tracking and certifications
- Mentoring and peer reviews
- Discussion forums and study groups
- Job placement assistance

## Technology Stack

### Backend
- **Framework**: FastAPI (mirroring the proven ATS resume analyzer pattern)
- **AI Integration**: OpenRouter API with `openrouter/free` model
- **Database**: Vector embeddings for skills and experience matching
- **Containerization**: Docker for consistent deployment

### Frontend
- **Framework**: React with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Chart.js for progress visualization
- **Animations**: Framer Motion for smooth transitions

### Infrastructure
- **Deployment**: GitHub Pages for frontend, containerized backend
- **Configuration**: YAML-based settings
- **Analytics**: Plausible for user behavior tracking
- **CDN**: GitHub Pages for static assets

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-pm-lesson-platform

cd ai-pm-lesson-platform
```

### 2. Set Up Environment

Copy the environment configuration:

```bash
cp .env.example .env

# Edit .env and set your OPENROUTER_API_KEY
# The API key is already configured: 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
```

### 3. Install Dependencies

Using uv (as per project standards):

```bash
uv sync

# Or for development
uv run pip install -e .
```

### 4. Start Development Server

#### Backend
```bash
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend

npm install

npm run dev
```

Access the applications at:
- **Backend API**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`

### 5. Build for Production

```bash
# Build frontend
npm run build

# Build and run Docker container
uv run pip install -e .
docker build -t ai-pm-lesson-platform .
docker run -p 8000:8000 -p 3000:3000 ai-pm-lesson-platform
```

## Project Structure

```
aio-pm-lesson-platform/
├── backend/
│   ├── __init__.py
│   ├── core/                    # Core analysis logic
│   │   ├── analysis.py         # AI PM resume analysis
│   │   ├── models.py           # Data models
│   │   └── utils.py            # Helper functions
│   ├── routes.py               # API routes
│   └── main.py                 # FastAPI application
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Application pages
│   │   └── App.tsx           # Main application component
│   └── config/                # Frontend configuration
├── templates/                  # Component templates
├── docker/                     # Docker configuration
├── scripts/                    # Deployment scripts
└── README.md                  # Documentation
```

## Usage

### Resume Analysis
1. Upload your resume (PDF, DOCX, or TXT)
2. Enter the AI Product Manager job description you're targeting
3. Select your experience level (auto-detected if not specified)
4. Receive comprehensive analysis with ATS-like scoring
5. Get specific improvement suggestions based on the analysis

### Learning Modules
1. Browse available modules and lessons
2. Track your progress through the curriculum
3. Complete interactive exercises and assessments
4. Earn certificates upon module completion
5. Compare your skills with industry benchmarks

### Tools & Assistants
1. **Prompt Engineering**: Create, test, and refine prompts for AI applications
2. **Product Development**: Get AI-powered suggestions for product features and strategy
3. **Skills Assessment**: Validate your technical and product management capabilities
4. **Industry Insights**: Stay updated on AI product trends and opportunities

## Configuration

### Backend Configuration (`config.yaml`)

The platform uses YAML-based configuration for:

#### Scoring Weights
- Customize the importance of different analysis components
- Adjust thresholds for different AI PM experience levels

#### File Upload Settings
- Maximum file sizes and supported formats
- Resume parsing capabilities

#### AI Model Configuration
- OpenRouter API integration settings
- Model parameters and limits

#### Performance Settings
- API rate limits and concurrency settings
- Caching strategies and optimization

## API Reference

### Key Endpoints

#### POST `/api/analyze-pm-resume`
Analyze resume for AI Product Manager roles

**Request Body**:
```json
{
  "resume": {
    "file": "base64-encoded-file",
    "filename": "resume.pdf"
  },
  "job_description": "Senior AI Product Manager position...
  "position_level": "senior"
}
```

**Response**:
```json
{
  "ats_score": 85,
  "score_breakdown": {
    "technical_skills": 90,
    "product_management": 85,
    "ai_ml_expertise": 80,
    "leadership_skills": 75,
    "prompt_engineering": 90,
    "industry_knowledge": 70
  },
  "ai_pm_specific_suggestions": [
    "Enhance your prompt engineering examples",
    "Add more experience with LLM product integration",
    "Showcase leadership in cross-functional AI projects"
  ],
  "matched_skills": ["Prompt Engineering", "React", "Python"],
  "missing_skills": ["TensorFlow", "AWS", "Product Analytics"],
  "recommended_lessons": ["module_3", "module_4"]
}
```

## Deployment

### GitHub Pages

#### Option 1: Automatic with GitHub Actions

1. Enable GitHub Pages in repository settings
2. Configure GitHub Actions workflow in `.github/workflows/`
3. Commit changes to trigger deployment

#### Option 2: Manual Deployment

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t ai-pm-lesson-platform .

# Run the application
docker run -p 8000:8000 -p 3000:3000 ai-pm-lesson-platform
```

## Testing

### Run Local Tests

```bash
# Run backend tests
uv run pytest

# Run specific test suites
uv run pytest backend/tests/

# Run frontend tests
npm test
```

### Performance Testing

```bash
# Run performance benchmarks
uv run python -m pytest tests/performance/ -v

# Test with load
docker-compose -f docker-compose.test.yml up --build
```

## Security

### Authentication & Access Control

- API key-based authentication for analysis endpoints
- Rate limiting to prevent abuse
- IP whitelisting options for enterprise users

### Data Protection

- Encrypted file storage for resumes
- Secure API communications (HTTPS)
- GDPR compliance for European users
- HIPAA compliance for healthcare data

### Compliance

- Industry-specific compliance (HIPAA for healthcare, SOC 2 for enterprise)
- Regular security audits and penetration testing
- Data encryption at rest and in transit
- Comprehensive logging and monitoring

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multiple users can work on the same resume analysis
- **Automated Resume Generation**: Create optimized resumes based on analysis
- **Industry-Specific Scoring**: Custom algorithms for FinTech, HealthTech, etc.
- **Experience Verification**: Background check integration with references
- **Career Pathing**: Suggest optimal career trajectories based on skills

### Advanced ML Features
- **Neural Networks**: For semantic similarity analysis
- **Deep Learning**: For skill extraction and matching
- **Natural Language Generation**: For auto-generated improvement suggestions
- **Predictive Analytics**: For job application success prediction

## Contributing

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/TypeScript
- Maintain test coverage >90%
- Write comprehensive documentation

### Development Workflow
1. Create feature branch
2. Write tests for new functionality
3. Implement changes
4. Run full test suite
5. Create pull request with description
6. Code review and approval
7. Merge to main branch

### Bug Reports

File issues with:
- Clear, descriptive title
- Detailed reproduction steps
- Expected vs. actual behavior
- Screenshots or sample data when possible

## Support

### Documentation
- [API Reference](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Deployment Instructions](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Community
- GitHub Issues for bug reports
- Discord/Stack Overflow for questions
- Contributing guidelines in `CONTRIBUTING.md`

### Commercial Support

Available through enterprise offering, including:
- 24/7 technical support
- On-site installation and training
- Custom development and integration
- SLA guarantees and support tickets

## License

MIT License - Free for commercial and non-commercial use.
See `LICENSE` file for details.

## Acknowledgments

This platform builds upon:
- [OpenRouter API](https://openrouter.ai/) for AI model access
- [FastAPI](https://fastapi.tiangolo.com/) for API development
- [React](https://react.dev/) for the frontend
- [Tailwind CSS](https://tailwindcss.com/) for styling
- The proven ATS Resume Analyzer architecture
- Claude Code for development assistance

## Versioning

### Semantic Versioning
- **MAJOR version** for breaking changes
- **MINOR version** for new features
- **PATCH version** for bug fixes

### Changelog
See `CHANGELOG.md` for a detailed history of changes and improvements.

---

This platform provides a solid foundation for AI Product Manager learning and development. It's designed to be extensible, maintainable, and production-ready while allowing for customization and enhancement based on specific requirements.