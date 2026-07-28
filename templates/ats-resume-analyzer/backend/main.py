"""
Main FastAPI application for ATS Resume Analyzer.
"""

import os
import sys
import tempfile
import uuid
import time
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path

# Import the analyzer module
from .core.analysis import ATSResumeAnalyzer
from .core.models import AnalysisRequest, FileUpload, AnalysisResponse

app = FastAPI(
    title="ATS Resume Analyzer",
    description="AI-powered resume analysis and job compatibility scoring",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global analyzer instance
analyzer = ATSResumeAnalyzer()

def save_upload_file(file: UploadFile) -> str:
    """Save uploaded file to temporary location."""
    # Create temporary directory
    temp_dir = Path("temp_uploads")
    temp_dir.mkdir(exist_ok=True)

    # Generate unique filename
    file_extension = Path(file.filename).suffix
    temp_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = temp_dir / temp_filename

    # Save file content
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)

    return str(file_path)
def get_file_type(filename: str) -> str:
    """Determine file type from filename."""
    extension = Path(filename).suffix.lower()
    if extension == '.pdf':
        return 'pdf'
    elif extension in ['.doc', '.docx']:
        return 'docx'
    elif extension == '.txt':
        return 'txt'
    else:
        raise ValueError(f"Unsupported file type: {extension}")
@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "name": "ATS Resume Analyzer",
        "version": "0.1.0",
        "description": "AI-powered resume analysis and job compatibility scoring"
    }
@app.post("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}
@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    position_level: str = Form("auto")
) -> AnalysisResponse:
    """
    Analyze resume against job description.

    Args:
        resume: Uploaded resume file (PDF, DOC, DOCX, or TXT)
        job_description: Job description text
        position_level: Experience level (auto, junior, mid, senior, director)

    Returns:
        AnalysisResponse with ATS score and improvement suggestions
    """
    start_time = time.time()

    try:
        # Validate file
        if not resume.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Determine file type and validate
        file_type = get_file_type(resume.filename)

        # Save uploaded file
        file_path = save_upload_file(resume)

        # Extract text from file
        extracted_text = analyzer.parse_resume_file(file_path, file_type)

        # Analyze resume against job description
        analysis_result = analyzer.analyze_resume(extracted_text, job_description)

        # Clean up temporary file
        os.remove(file_path)

        # Prepare response
        response = AnalysisResponse(
            success=True,
            message="Resume analysis completed successfully",
            ats_score=analysis_result.ats_score,
            score_breakdown={
                'keyword_match': analysis_result.score_breakdown.keyword_match,
                'skills_alignment': analysis_result.score_breakdown.skills_alignment,
                'experience_match': analysis_result.score_breakdown.experience_match,
                'education_match': analysis_result.score_breakdown.education_match,
                'grammar_score': analysis_result.score_breakdown.grammar_score,
                'completeness_score': analysis_result.score_breakdown.completeness_score,
            },
            extracted_skills=analysis_result.extracted_skills,
            extracted_experience=analysis_result.extracted_experience,
            extracted_education=analysis_result.extracted_education,
            missing_keywords=analysis_result.missing_keywords,
            suggested_skills=analysis_result.suggested_skills,
            improvements=analysis_result.improvements,
            strongest_matches=analysis_result.strongest_matches,
            strengths=analysis_result.strengths,
            weaknesses=analysis_result.weaknesses,
            analysis_date=analysis_result.analysis_date.isoformat(),
            processing_time=time.time() - start_time
        )

        return response

    except Exception as e:
        # Clean up temporary file in case of error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )
@app.get("/supported-formats")
async def get_supported_formats() -> Dict[str, Any]:
    """Get supported file formats and their specifications."""
    return {
        "formats": [
            {
                "extension": ".pdf",
                "name": "PDF Document",
                "description": "Adobe PDF files",
                "max_size": "10MB",
                "ocr_supported": True
            },
            {
                "extension": ".doc",
                "name": "Microsoft Word (Legacy)",
                "description": "Word 97-2003 documents",
                "max_size": "10MB",
                "ocr_supported": False
            },
            {
                "extension": ".docx",
                "name": "Microsoft Word",
                "description": "Word 2007+ documents",
                "max_size": "10MB",
                "ocr_supported": False
            },
            {
                "extension": ".txt",
                "name": "Plain Text",
                "description": "Text files",
                "max_size": "5MB",
                "ocr_supported": False
            }
        ],
        "max_file_size_mb": 10,
        "ocr_languages": ["en"],
        "supported_positions": ["auto", "junior", "mid", "senior", "director", "vice_president", "director", "executive"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)