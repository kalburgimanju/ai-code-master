# Powershell deployment script for the Comprehensive Portfolio Site
# Requires PowerShell 7+ and Vercel CLI

# Function to print colored output
function Write-Info {
    Write-Host "[INFO] $1" -ForegroundColor Green
}

function Write-Warn {
    Write-Host "[WARN] $1" -ForegroundColor Yellow
}

function Write-Error {
    Write-Host "[ERROR] $1" -ForegroundColor Red
}

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Warn "Vercel CLI not found. Installing..."
    npm install -g vercel
}

# Navigate to frontend directory
$frontendDir = "frontend"

if (-not (Test-Path $frontendDir)) {
    Write-Error "Frontend directory not found!"
    exit 1
}

Write-Info "Building the portfolio site..."
cd $frontendDir

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Info "Installing dependencies..."
    npm install --production
}

# Build the application
Write-Info "Building application..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

Write-Info "Build successful!"

# Copy the built application to root dist directory
Write-Info "Copying built application to root dist..."
cd ..
mkdir -Force dist
copy frontend\dist\* dist\ -Recurse -Force

# Create Vercel project if it doesn't exist
$vercelProjects = vercel projects ls
if (-not ($vercelProjects -like "*portfolio-site*")) {
    Write-Info "Creating Vercel project 'portfolio-site'..."
    vercel --prod
} else {
    Write-Info "Vercel project 'portfolio-site' already exists."
}

# Deploy to Vercel
Write-Info "Deploying to Vercel..."
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Info "✅ Deployment successful!"
    Write-Info "Your portfolio site is now live on Vercel."
} else {
    Write-Error "Deployment failed!"
    exit 1
}

Write-Info "🎉 Portfolio site deployment complete!"
Write-Info "Visit your site at the Vercel-provided URL."