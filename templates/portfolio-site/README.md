# Comprehensive Developer Portfolio Site

A unified portfolio website showcasing AI/ML projects, books authored, and technical expertise.

## Overview

This portfolio site serves as a comprehensive showcase of technical projects, including:
- **AI/ML Projects**: Resume analyzers, lesson platforms, and innovative AI applications
- **Books Authored**: "AI Agents: The Complete Guide" and "Customer Experience Automation"
- **Technical Expertise**: Skills, experience, and implementation examples

## Site Architecture

```
portfolio-site/
├── backend/                    # Flask/FastAPI backend for content management
├── frontend/                   # React frontend with TypeScript
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Application pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── BooksPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   └── BookDetailPage.tsx
│   │   ├── types/               # TypeScript type definitions
│   │   │   ├── book.ts
│   │   │   ├── project.ts
│   │   │   ├── experience.ts
│   │   │   └── skill.ts
│   │   └── utils/               # Utility functions
│   │       ├── data.ts           # Sample data
│   │       └── api.ts            # API utilities
│   ├── assets/                # Design assets
│   └── package.json           # Project configuration
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── ... (additional docs)
├── scripts/                    # Build and deployment scripts
├── backend/                   # Backend API server
│   ├── app.py                # Flask/FastAPI application
│   ├── models/               # Data models
│   ├── services/             # Business logic
│   ├── routes/               # API route handlers
│   └── requirements.txt
└── package.json               # Project configuration
```

## Key Features

### 📚 Books Section
- Display "AI Agents: The Complete Guide"
- Showcase "Customer Experience Automation"
- Include chapter summaries and interactive web apps
- Link to live deployments

### 🚀 Projects Section
- **AI Product Manager Learning Platform**: Resume analysis and skills assessment
- **ATS Resume Analyzer**: AI-powered resume screening
- **Developer Portfolio**: Modern responsive portfolio template
- **Additional Projects**: Expand with more project examples

### 👤 About Section
- Professional background and expertise
- Technical skills and competencies
- Career journey and milestones

### 🔗 Live Demos
- Interactive project showcases
- Book web applications
- Real-time demonstrations

## Technology Stack

### Backend
- **Framework**: Flask/FastAPI
- **Database**: SQLite/PostgreSQL (for book content management)
- **API**: REST APIs for content management
- **Authentication**: Simple auth for admin functionalities

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API + Zustand
- **Animation**: Framer Motion for smooth transitions
- **Routing**: React Router for navigation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Development
- **Build Tool**: Vite
- **Package Manager**: npm/yarn
- **Testing**: Jest and React Testing Library
- **Linting**: ESLint with TypeScript support
- **Type Checking**: TypeScript strict mode
- **Pre-commit**: Husky and lint-staged

## Project Details

### 1. AI Agents: The Complete Guide
A comprehensive ebook covering:
- LLMs & GenAI Fundamentals
- RAG & Knowledge Systems
- Introduction to AI Agents
- Building various types of agents (Customer Support, Developer, Designer, etc.)
- Multi-agent systems and orchestration
- Complete end-to-end project build
- Security, safety, and guardrails
- Current trends and future perspectives

**Live Demo**: [https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/](https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/)

### 2. Customer Experience Automation
A practical guide covering:
- Customer journey optimization
- Automation tools and strategies
- Email automation workflows
- Omnichannel customer engagement
- Analytics and implementation
- Real-world case studies

### 3. AI Product Manager Learning Platform
A comprehensive learning platform featuring:
- Resume analysis for AI PM roles (6-dimensional scoring)
- Interactive learning modules (5 modules)
- Advanced tools and utilities
- Progress tracking and certifications
- Industry insights and benchmarks

### 4. ATS Resume Analyzer
An intelligent application that:
- Analyzes resumes against job descriptions
- Provides compatibility scores (0-100)
- Offers actionable improvement suggestions
- Supports multiple file formats (PDF, DOCX, TXT)
- Includes industry-specific analysis

### 5. Developer Portfolio Template
A modern portfolio template featuring:
- Responsive design for all devices
- Dark mode support
- Smooth animations with Framer Motion
- Project showcase with GitHub links
- Interactive timeline and skill displays
- TypeScript for type safety

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.8+ (for any backend services)
- PostgreSQL (optional, for enhanced features)

### Installation

```bash
# Clone the repository
cd portfolio-site

# Install frontend dependencies
npm install

# Install backend dependencies (if any)
pip install -r backend/requirements.txt

# Set up environment variables
# Copy .env.example to .env and configure
```

### Running the Application

```bash
# Start development server
npm run dev

# Or run in specific frontend directory
cd frontend
npm run dev
```

The development server will start at `http://localhost:3000` and open your browser automatically.

### Building for Production

```bash
# Build the frontend
npm run build

# Build the backend (if applicable)
pip install -r backend/requirements.txt

# Deploy (adjust based on your hosting provider)
```

## Content Management

The portfolio site dynamically pulls content from:

### Project Templates
- **AI Product Manager Platform** (templates/ai-pm-lesson-platform)
- **ATS Resume Analyzer** (templates/ats-resume-analyzer)
- **Developer Portfolio** (templates/portfolio)

### Book Repositories
- **AI Agents: The Complete Guide** (books/AI-Agents)
- **Customer Experience Automation** (books/CX-Automation)

### Content Management
- **Sample Data**: Centralized in `frontend/src/utils/data.ts`
- **Dynamic Loading**: GitHub API integration for book content
- **Caching**: Performance optimization for content loading

## Live Versions

### Portfolio Site
Being developed - features will be added over time

### AI Agents Book
**[https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/](https://kalburgimanju.github.io/ai-code-master/books/AI-Agents/webapp/)**  
A fully interactive web application covering AI agent development

### Projects
Various project templates are available in the templates/ directory:
- `templates/ai-pm-lesson-platform/` - AI Product Manager platform
- `templates/ats-resume-analyzer/` - Resume analyzer
- `templates/portfolio/` - Portfolio template

## Contributing

### Adding New Projects
1. Add a new README.md in the portfolio-site/project-templates/ directory
2. Create a JSON configuration file in project-configs/
3. Update the main Projects component to include the new project

### Adding New Books
1. Copy the book structure from existing examples
2. Update the book-config.json with book details
3. Configure GitHub Actions for content sync
4. Update the Books component

### Code Standards
- **ESLint**: Follow standard JavaScript/TypeScript conventions
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Testing**: Jest and React Testing Library
- **Documentation**: README files for all major components

### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request with description
5. Code review and approval
6. Merge to main

## Project Timeline

### Phase 1: Core Structure (Completed)
- Basic site structure
- Navigation system
- Book display section
- Project showcase

### Phase 2: Interactive Features
- Dynamic content loading
- Project filtering and search
- Book chapter navigation
- Live demo embeds

### Phase 3: Advanced Features
- User authentication
- Content management system
- Analytics and tracking
- Mobile app version

## Contact

For questions, support, or collaboration opportunities:

- **GitHub**: [kalburgimanju](https://github.com/kalburgimanju)
- **Email**: Available through contact form
- **LinkedIn**: Professional network
- **Twitter**: @yourusername (if applicable)

## Copyright and License

© 2025 Manjunath Kalburgi

This portfolio site is part of an open-source collection of AI/ML projects and educational materials. All rights reserved.

Permission is hereby granted to use, modify, and distribute this portfolio site for personal and educational purposes, subject to the following conditions:

1. All original projects and their licenses must be preserved
2. Modifications must be clearly documented
3. Attribution must be provided to the original authors
4. This portfolio site cannot be used for commercial purposes without explicit permission

## Acknowledgments

This portfolio site builds upon numerous open-source projects and templates:

- Vercel AI Agents book structure
- Next.js book deployment
- Component libraries (React, Tailwind CSS)
- Animation libraries (Framer Motion)
- Icon libraries (Lucide React)
- Development tools (Vite, ESLint, TypeScript)

Special thanks to the open-source community for their contributions and innovation.

## Versioning

Semantic versioning is followed:
- **PATCH**: Bug fixes and minor improvements
- **MINOR**: New features and enhancements
- **MAJOR**: Breaking changes and major updates

Current version: `1.0.0`

## Future Enhancements

### Upcoming Features
1. **Real-time Collaboration**: Multiple users can interact with the portfolio
2. **Advanced Book Filtering**: Categorize books by topics and technologies
3. **Interactive Projects**: Live demos and code playgrounds
4. **Personal Blog**: Technical blog integration
5. **Mobile App**: Cross-platform mobile version
6. **AI Chat Assistant**: Ask questions about projects and books

### Technical Improvements
1. **Performance Optimization**: Better loading times and caching
2. **Accessibility**: Enhanced screen reader support
3. **SEO**: Better search engine optimization
4. **Offline Support**: Progressive web app capabilities
5. **Theme Customization**: User-selectable themes
6. **Internationalization**: Multi-language support

## Disclaimer

This portfolio site is a work in progress. Some features may be incomplete or contain bugs. User feedback is encouraged to improve the site. The author reserves the right to change the site structure and features without prior notice.

---

*Built with ❤️ using React, TypeScript, and modern web technologies. Designed to showcase AI/ML projects and educational content.*