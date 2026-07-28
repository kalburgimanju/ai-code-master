#!/usr/bin/env python3
"""
Setup script for ATS Resume Analyzer.
"""

import os
import subprocess
import sys
from pathlib import Path
def run_command(cmd, description):
    """Run a command and check for errors."""
    print(f"\n🔧 {description}")
    print(f"Running: {cmd}")

    try:
        result = subprocess.run(
            cmd, shell=True, check=True, capture_output=True, text=True
        )
        print(f"✅ Success: {description}")
        if result.stdout:
            print(f"Output: {result.stdout[:200]}...")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description}")
        print(f"Error: {e.stderr}")
        return False
def main():
    """Main setup function."""
    print("🚀 Setting up ATS Resume Analyzer...")

    # Check Python version
    if sys.version_info < (3, 11):
        print("❌ Python 3.11+ is required")
        return 1

    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Install Python dependencies"):
        return 1

    # Create necessary directories
    directories = [
        "data",
        "temp_uploads",
        "logs",
        "exports",
        "backend/core",
        "frontend/public",
    ]

    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")

    # Check for frontend files
    if Path("frontend/package.json").exists():
        print("\n📦 Frontend package.json found")
        print("To install frontend dependencies, run:")
        print("  cd frontend && npm install")
    else:
        print("\n⚠️  Frontend package.json not found")
        print("Frontend dependencies will need to be installed manually")

    # Create .env file if it doesn't exist
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write("# ATS Resume Analyzer Environment Variables\n")
            f.write("# Copy this file to .env and fill in your values\n\n")
            f.write("API_KEY=your-api-key-here\n")
            f.write("MODEL=gpt-4\n")
            f.write("LOG_LEVEL=INFO\n")
            f.write("MAX_FILE_SIZE=10485760\n")  # 10MB

        print(f"📄 Created .env file with default values")

    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Start the backend server:")
    print("   cd /path/to/ats-resume-analyzer")
    print("   python backend/main.py")
    print("\n2. Start the frontend (if using one):")
    print("   cd /path/to/ats-resume-analyzer/frontend")
    print("   npm run dev")
    print("\n3. Access the application:")
    print("   Backend: http://localhost:8000")
    print("   Frontend: http://localhost:3000")

    return 0
if __name__ == "__main__":
    sys.exit(main())