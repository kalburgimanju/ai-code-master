# Contribution Guidelines

Thank you for your interest in contributing to the Comprehensive Portfolio Site! This document outlines the contribution guidelines to help you get started and ensure a smooth collaboration process.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)
6. [Review Process](#review-process)
7. [Repository Management](#repository-management)
8. [Security Guidelines](#security-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ (for frontend development)
- Python 3.8+ (for backend development)
- Git
- npm or yarn

### Installation

```bash
# Clone the repository
cd portfolio-site

# Install frontend dependencies
npm install

# Install backend dependencies (if applicable)
pip install -r backend/requirements.txt

# Set up environment variables
# Copy .env.example to .env and configure
```

### Running the Application

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

### Frontend (React + TypeScript)

```
frontend/
├── src/
│   ├── components/          # UI components
│   │   ├── common/           # Common components (Card, Button, Input)
│   │   ├── layout/           # Layout components (Navbar, Footer)
│   │   └── features/         # Feature-specific components
│   ├── contexts/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProjectsPage.tsx
│   │   ├── BookDetailPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── BooksPage.tsx
│   ├── types/               # TypeScript definitions
│   │   ├── book.ts
│   │   ├── project.ts
│   │   ├── experience.ts
│   │   └── skill.ts
│   ├── utils/                # Utility functions
│   │   ├── data.ts           # Sample data
│   │   └── api.ts            # API utilities
│   ├── routes/               # Application routes
│   ├── styles/               # CSS files
│   └── assets/               # Static assets
├── package.json            # Project configuration
└── vite.config.ts          # Build configuration
```

### Backend (Flask/FastAPI)

```
backend/
├── app.py                  # Flask/FastAPI application
├── config/                # Configuration files
├── models/               # Data models and schemas
├── services/             # Business logic
├── routes/               # API route handlers
├── templates/            # HTML templates (if needed)
├── static/               # Static assets
└── requirements.txt      # Python dependencies
```

## Code Standards

### TypeScript
- Use `eslint` for linting: `npm run lint`
- Use `prettier` for formatting: `npm run format`
- Follow the project's TypeScript configuration in `frontend/tsconfig.json`

### React
- Use functional components with TypeScript
- Use React Hooks for state management
- Use JSX for component rendering
- Follow the rule of hooks

### JavaScript
- Use `useState`, `useEffect`, and custom hooks for state management
- Use functional components with `React.createElement`
- Use Jest for testing React components

### CSS
- Use Tailwind CSS for styling
- Use utility classes for styling
- Use CSS modules for component-specific styles

### Git
- Use feature branches for development
- Use descriptive commit messages
- Follow the project's commit message conventions

## Testing

### Frontend Tests
```bash
# Run frontend tests
npm test

# Run specific test suites
npm test -- --testPathPattern="frontend/src/components/"

# Run tests with coverage
npm test -- --coverage
```

### Backend Tests
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

### Test Structure
- Write unit tests for individual components
- Write integration tests for API endpoints
- Write end-to-end tests for user flows
- Use Jest and React Testing Library for testing React components
- Use Pytest for testing Python code

## Pull Request Process

### 1. Fork the Repository
- Fork the repository to your GitHub account
- Clone your forked repository

### 2. Create a Feature Branch
```bash
# Create a new branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Implement your feature or fix
- Update tests as needed
- Run the test suite to ensure everything passes

### 4. Commit Changes
```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add feature: description\n\n- Detail the changes\n- Reference related issues"
```

### 5. Push Changes
```bash
# Push to your branch
git push origin feature/your-feature-name
```

### 6. Create a Pull Request
- Go to your repository on GitHub
- Click on "Pull requests"
- Click "New pull request"
- Select your base branch (main)
- Write a clear title and description
- Include screenshots or examples if applicable
- Submit the pull request

## Review Process

### Code Review
- Other contributors will review your pull request
- Address feedback and make necessary changes
- Ensure all requirements are met
- Get approval from at least one maintainer

### Automated Checks
- Tests run automatically on pull request
- Code quality checks (linting, formatting)
- Security checks
- Performance tests

### Manual Review
- Manual testing to ensure functionality
- Code review for quality and maintainability
- Documentation review
- Accessibility review

## Repository Management

### Branch Structure
- `main`: Main branch with production-ready code
- `develop`: Development branch with latest features
- `feature/`: Feature branches for specific features
- `hotfix/`: Hotfix branches for urgent fixes

### Versioning
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update version in `package.json` and `pyproject.toml`
- Update changelog when releasing new versions

### Pull Request Rules
- Only merge approved pull requests
- Rebase and squash commits before merging
- Update documentation as needed

## Security Guidelines

### Authentication and Authorization
- Use environment variables for sensitive data
- Never commit sensitive data to the repository
- Use secure password hashing
- Implement proper authentication and authorization

### Input Validation
- Validate all user inputs
- Use allowlists instead of blocklists
- Sanitize all user inputs

### Error Handling
- Use secure error handling practices
- Don't expose sensitive information in error messages
- Log errors appropriately

## License

This project is licensed under the MIT License. See the LICENSE file for more information.

## Support

For questions or issues, please:

1. Check the project's documentation
2. Look at existing issues in the repository
3. Open a new issue if needed
4. Contact maintainers for collaboration opportunities

---

*Thank you for contributing to the Comprehensive Portfolio Site! Your contributions help make this project better for everyone.*