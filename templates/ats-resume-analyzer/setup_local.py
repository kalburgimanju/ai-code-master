#!/usr/bin/env python3
"""
Local setup script for ATS Resume Analyzer.

This script helps set up the project for local development and testing
without requiring heavy dependencies that might have build issues in this environment.
"""

import os
import sys
import subprocess
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
            output = result.stdout.strip()[:200]
            if output:
                print(f"Output: {output}...")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {description}")
        if e.stderr:
            stderr = e.stderr.strip()[:500]
            if stderr:
                print(f"Error: {stderr}...")
        return False
def main():
    """Main setup function."""
    print("🚀 Setting up ATS Resume Analyzer for Local Development...")
    print("Note: Using minimal dependencies to avoid build issues.")

    # Check Python version
    if sys.version_info < (3, 11):
        print("❌ Python 3.11+ is required")
        return 1

    # Install minimal dependencies (avoiding problematic packages like pandas)
    if not run_command("pip install -r requirements-minimal.txt", "Install Python dependencies"):
        return 1

    # Create necessary directories
    directories = [
        "data",
        "temp_uploads",
        "logs",
        "exports",
        "backend/core",
        "frontend/public",
        "frontend/src/assets",
    ]

    print(f"\n📁 Creating directories...")
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"   Created: {directory}")

    # Create sample data
    print(f"\n📄 Creating sample data files...")

    # Create sample config.yaml if it doesn't exist
    if not Path("config.yaml").exists():
        sample_config = """
# ATS Resume Analyzer Configuration
# Sample configuration for testing
scoring_weights:
  keywords: 0.3
  skills: 0.25
  experience: 0.25
  education: 0.1
  grammar: 0.05
  completeness: 0.05

minimum_thresholds:
  keywords: 20
  skills: 15
  experience: 12
  education: 10
  overall: 50

analysis_settings:
  max_text_length: 50000
  max_keywords_count: 100
  max_skills_count: 50
  industry_specific: true
"""
        with open("config.yaml", "w") as f:
            f.write(sample_config.strip())
        print(f"   Created: config.yaml")

    # Create sample .env file
    if not Path(".env").exists():
        if Path("sample.env").exists():
            import shutil
            shutil.copy("sample.env", ".env")
            print(f"   Created: .env (from sample.env)")
        else:
            with open(".env", "w") as f:
                f.write("""# ATS Resume Analyzer Environment Variables
# Set your API keys here

# OpenRouter API Key (optional)
OPENROUTER_API_KEY=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

# Debug mode for development
DEBUG=true
LOG_LEVEL=INFO
""")
            print(f"   Created: .env (with sample values)")

    print(f"\n🎉 Local setup completed successfully!")
    print(f"\n📋 Next steps for development:")
    print(f"1. Start the backend server:")
    print(f"   cd /path/to/ats-resume-analyzer")
    print(f"   python backend/main.py")
    print(f"\n2. Start the frontend development server:")
    print(f"   cd /path/to/ats-resume-analyzer/frontend")
    print(f"   npm run dev")
    print(f"\n3. Access the applications:")
    print(f"   Backend API: http://localhost:8000")
    print(f"   Frontend: http://localhost:3000")
    print(f"\n4. Run tests:")
    print(f"   cd /path/to/ats-resume-analyzer")
    print(f"   python -m pytest tests/ -v")

    print(f"\n💡 Tips for development:")
    print(f"   • Check README.md for detailed documentation")
    print(f"   • Use 'uv sync' for faster dependency management")
    print(f"   • Run 'pip install -r requirements-minimal.txt' for minimal setup")

    return 0
if __name__ == "__main__":
    sys.exit(main())