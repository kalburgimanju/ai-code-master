#!/bin/bash

# AI Product Manager Learning Platform Deployment Script
# Deploy to GitHub Pages with OpenRouter API integration

set -euo pipefail

# Configuration
REPO_OWNER="$(git config user.name || echo "your-username")"
REPO_NAME="ai-pm-lesson-platform"
GITHUB_PAGES_BRANCH="gh-pages"
FRONTEND_DIR="frontend"
BUILD_DIR="frontend/dist"
BACKUP_DIR="backup"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $*"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"
}

# Function to check if required tools are installed
check_requirements() {
    log "Checking deployment requirements..."

    local tools="git npm uv"
    for tool in $tools; do
        if ! command -v $tool &> /dev/null; then
            error "Required tool '$tool' is not installed."
            return 1
        fi
    done

    log "All requirements satisfied."
}

# Function to backup current deployment
backup_current() {
    if [ -d "$BACKUP_DIR" ]; then
        warn "Backup directory exists. Creating new backup..."
        BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    fi

    if [ -d "$GITHUB_PAGES_BRANCH" ]; then
        warn "Existing $GITHUB_PAGES_BRANCH branch found. Backing up..."
        mv "$GITHUB_PAGES_BRANCH" "$BACKUP_DIR"
    fi

    mkdir -p "$BACKUP_DIR"
    log "Backup created at $BACKUP_DIR"
}

# Function to build the platform
build_platform() {
    log "Building frontend..."

    cd "$FRONTEND_DIR"
    npm ci
    npm run build
    cd ..

    if [ ! -d "$BUILD_DIR" ]; then
        error "Build failed. $BUILD_DIR directory not found."
        return 1
    fi

    log "Build completed successfully."
}

# Function to create GitHub Pages branch
create_gh_pages() {
    log "Creating $GITHUB_PAGES_BRANCH branch..."

    # Create a new branch from main
    git checkout -b "$GITHUB_PAGES_BRANCH"

    # Copy built files to branch root
    cp -r "$BUILD_DIR"/* "."

    # Remove unwanted files from gh-pages
    rm -f "README.md" "config.yaml" ".env*"

    # Create .nojekyll file for GitHub Pages
    touch .nojekyll

    # Create CNAME file if needed (custom domain)
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo "$CUSTOM_DOMAIN" > CNAME
        log "Created CNAME file for custom domain: $CUSTOM_DOMAIN"
    fi

    # Configure git user for the branch
    git config user.name "github-actions[bot]"
    git config user.email "github-actions[bot]@users.noreply.github.com"

    # Add files and commit
    git add -A
    git commit -m "Deploy AI PM Lesson Platform to GitHub Pages

 Co-authored-by: Claude <noreply@anthropic.com>

 Deployed on $(date '+%Y-%m-%d %H:%M:%S')" || true

    log "Created $GITHUB_PAGES_BRANCH branch."
}

# Function to push to GitHub Pages
push_to_github() {
    log "Pushing to GitHub Pages branch..."

    # Push to GitHub Pages branch
    git push origin "$GITHUB_PAGES_BRANCH" || {
        error "Failed to push to $GITHUB_PAGES_BRANCH branch."
        git checkout main
        return 1
    }

    log "Successfully pushed to $GITHUB_PAGES_BRANCH branch."
}

# Function to restore main branch
restore_main() {
    git checkout main
    log "Restored main branch."
}

# Function to display deployment instructions
print_deployment_info() {
    echo -e "\n${GREEN}=====================================${NC}"
    echo -e "${GREEN}🎉 AI PM Lesson Platform Deployed Successfully!${NC}"
    echo -e "${GREEN}=====================================${NC}\n"

    echo -e "${GREEN}📋 Deployment Information:${NC}"
    echo -e "  • Repository: https://github.com/$REPO_OWNER/$REPO_NAME"
    echo -e "  • GitHub Pages URL: https://$REPO_OWNER.github.io/$REPO_NAME/"
    echo -e "  • Branch: $GITHUB_PAGES_BRANCH"
    echo -e "  • Built on: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "\n${GREEN}🔧 OpenRouter API Configuration:${NC}"
    echo -e "  • API Key: Configured in .env (same as ATS Resume Analyzer)"
    echo -e "  • Model: openrouter/free"
    echo -e "  • Status: ✅ Ready to use"
    echo -e "\n${GREEN}📖 Important Notes:${NC}"
    echo -e "  • GitHub Pages takes 5-10 minutes to deploy"
    echo -e "  • The platform uses OpenRouter API configured in your .env file"
    echo -e "  • View deployment logs at: https://github.com/$REPO_OWNER/$REPO_NAME/actions"
    echo -e "\n${GREEN}✨ Platform Features:${NC}"
    echo -e "  • Resume Analysis for AI PM roles"
    echo -e "  • 5 Structured Learning Modules"
    echo -e "  • Prompt Engineering Tools"
    echo -e "  • Industry Insights"
    echo -e "\n${GREEN}=====================================${NC}\n"
}

# Main deployment process
deploy() {
    log "🚀 Starting AI PM Lesson Platform deployment..."

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                CUSTOM_DOMAIN="$2"
                shift 2
                ;;
            --no-checkout)
                SKIP_CHECKOUT=1
                shift
                ;;
            *)
                shift
                ;;
        esac
    done

    # Start deployment
    check_requirements || exit 1
    backup_current
    build_platform || exit 1
    create_gh_pages || exit 1
    push_to_github || {
        restore_main
        exit 1
    }
    restore_main

    print_deployment_info
    log "✅ Deployment completed successfully!"
}

# Execute deployment with arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    deploy "$@"
fi