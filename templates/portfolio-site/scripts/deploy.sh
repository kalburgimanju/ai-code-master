#!/bin/bash
# Bash deployment script for the Comprehensive Portfolio Site
# Requires Vercel CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    warn "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
FRONTEND_DIR="frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    error "Frontend directory not found!"
    exit 1
fi

info "Building the portfolio site..."
cd $FRONTEND_DIR

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    info "Installing dependencies..."
    npm install --production
fi

# Build the application
info "Building application..."
npm run build

if [ $? -ne 0 ]; then
    error "Build failed!"
    exit 1
fi

info "Build successful!"

# Copy the built application to root dist directory
info "Copying built application to root dist..."
cd ..
mkdir -p dist
cp -r frontend/dist/* dist/

# Create Vercel project if it doesn't exist
if ! vercel projects ls 2>/dev/null | grep -q "portfolio-site"; then
    info "Creating Vercel project 'portfolio-site'..."
    vercel --prod
else
    info "Vercel project 'portfolio-site' already exists."
fi

# Deploy to Vercel
info "Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    info "✅ Deployment successful!"
    info "Your portfolio site is now live on Vercel."
else
    error "Deployment failed!"
    exit 1
fi

info "🎉 Portfolio site deployment complete!"
info "Visit your site at the Vercel-provided URL."

# Return to original directory
echo "Deployment finished. You are now in $(pwd)"