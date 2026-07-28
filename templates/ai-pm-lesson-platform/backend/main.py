"""
Main FastAPI application for AI Product Manager Learning Platform.

This application provides AI-powered resume analysis and learning module recommendations
specifically tailored for AI Product Manager roles and career development.
"""

import os
import sys
import tempfile
import uuid
import time
from typing import Dict, Any, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path

# Add parent directory to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Import the AI PM analyzer module
from core.analysis import AIResumeAnalyzer
from core.models import (
    ResumeAnalysis, JobDescriptionAnalysis,
    AIMPSkill, LearningModule, AIMPAnalysisResult,
    PositionLevel, ModuleType, ScoreBreakdown
)
from portfolio_manager import PortfolioManagementService, PortfolioGenerationError

app = FastAPI(
    title="AI Product Manager Learning Platform",
    description="AI-powered learning platform for AI Product Managers with resume analysis and career development tools",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
analyzer = AIResumeAnalyzer()
portfolio_service = PortfolioManagementService()
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
# Mock functions for AI PM analysis (these would be implemented elsewhere)
def generate_pm_recommendations(analysis_result: ResumeAnalysis) -> List[str]:
    """Generate AI PM specific recommendations."""
    recommendations = []
    for skill in analysis_result.suggested_skills[:3]:
        recommendations.append(f"Focus on developing {skill.skill} for AI PM role")
    return recommendations
def generate_learning_modules(analysis_result: ResumeAnalysis) -> List[LearningModule]:
    """Generate learning modules based on analysis."""
    modules = []
    for sector in analysis_result.sector_recommendations[:2]:
        modules.append(LearningModule(
            title=f"{sector} AI PM Module",
            module_type=ModuleType.FOUNDATIONS,
            description=f"Learn about AI PM in {sector}",
            lessons=[],
            estimated_hours=2.0,
            prerequisites=[],
            outcome="Understand AI PM in this sector",
            industry_relevance=0.8
        ))
    return modules
def generate_prompt_tools(analysis_result: ResumeAnalysis) -> List[Dict[str, Any]]:
    """Generate prompt engineering tools."""
    return [
        {
            "name": "AI PM Experience Summary",
            "template": "Create a compelling AI PM experience summary highlighting {achievements}",
            "category": "Resume Building",
            "use_case": "Build impressive AI PM resumes"
        }
    ]
def generate_development_roadmap(analysis_result: ResumeAnalysis) -> List[Dict[str, Any]]:
    """Generate career development roadmap."""
    return [
        {
            "phase": "Foundation",
            "duration": "3 months",
            "goals": ["Master technical skills", "Build AI project portfolio"],
            "milestones": ["Complete introductory modules", "Launch first AI project"]
        }
    ]
def generate_immediate_actions(analysis_result: ResumeAnalysis) -> List[str]:
    """Generate immediate action items."""
    return [
        "Update LinkedIn profile with AI PM keywords",
        "Build a portfolio showcasing AI project experience",
        "Network with AI PM community",
        "Practice interview questions"
    ]
def position_level_detection(target_role: str, text: str) -> PositionLevel:
    """Detect position level from text."""
    text_lower = text.lower()
    if 'senior' in text_lower or 'sr.' in text_lower:
        return PositionLevel.SENIOR
    elif 'lead' in text_lower or 'lead.' in text_lower:
        return PositionLevel.LEAD
    elif 'principal' in text_lower:
        return PositionLevel.PRINCIPAL
    elif 'junior' in text_lower or 'jr.' in text_lower:
        return PositionLevel.JUNIOR
    return PositionLevel.AUTO_DETECT
def get_industry_recommendations(industry: str, text: str) -> List[str]:
    """Get industry-specific recommendations."""
    return [f"Focus on {industry} AI PM best practices"]
def calculate_competitive_level(job_description: str, target_role: str) -> str:
    """Calculate competitive level for role."""
    return "Medium"
def get_compensation_range(target_role: str, industry: str) -> Dict[str, Any]:
    """Get compensation range for role."""
    return {"min": 80000, "max": 150000, "currency": "USD"}
def extract_responsibilities(text: str) -> List[str]:
    """Extract responsibilities from text."""
    return ["Product development", "Team leadership", "AI integration"]
def extract_tools(text: str) -> List[str]:
    """Extract tools mentioned in text."""
    return ["Jira", "Confluence", "Slack", "Notion"]
@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "name": "AI Product Manager Learning Platform",
        "version": "0.1.0",
        "description": "AI-powered learning platform for AI Product Managers with resume analysis and career development tools"
    }
@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}
@app.post("/analyze-pm-resume")
async def analyze_pm_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    position_level: str = Form("auto")
) -> AIMPAnalysisResult:
    """
    Analyze resume for AI Product Manager roles.

    Args:
        resume: Uploaded resume file (PDF, DOC, DOCX, or TXT)
        job_description: Job description for AI PM role
        position_level: Experience level (auto, junior, mid, senior, lead, principal)

    Returns:
        AIMPAnalysisResult with learning modules, prompt tools, and career recommendations
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
        analysis_result = analyzer.analyze_resume(extracted_text, job_description, position_level)

        # Generate AI PM specific recommendations
        pm_recommendations = generate_pm_recommendations(analysis_result)

        # Generate learning modules
        learning_modules = generate_learning_modules(analysis_result)

        # Generate prompt engineering tools
        prompt_tools = generate_prompt_tools(analysis_result)

        # Clean up temporary file
        os.remove(file_path)

        processing_time = time.time() - start_time

        # Prepare response
        response = AIMPAnalysisResult(
            success=True,
            message=f"AI PM resume analysis completed in {processing_time:.2f} seconds",
            learning_modules=learning_modules,
            prompt_tools=prompt_tools,
            recommended_journal_sources=[
                "https://hbr.org/topic/artificial-intelligence",
                "https://aiproductpodcast.com",
                "https://www.producthunt.com/ai-products",
                "https://www.saastr.com/ai-product-management"
            ],
            skill_gap_analysis={
                category: (100 - score)
                for category, score in {
                    'Technical Assessment': analysis_result.score_breakdown.technical_assessment,
                    'Product Management': analysis_result.score_breakdown.product_management,
                    'AI/ML Expertise': analysis_result.score_breakdown.ai_ml_expertise,
                    'Prompt Engineering': analysis_result.score_breakdown.prompt_engineering,
                    'Leadership Skills': analysis_result.score_breakdown.leadership_skills,
                    'Industry Alignment': analysis_result.score_breakdown.industry_alignment
                }.items()
            },
            development_roadmap=generate_development_roadmap(analysis_result),
            immediate_actions=generate_immediate_actions(analysis_result),
            platform_features_used=[
                "ai-resume-analysis",
                "skill-assessment",
                "learning-modules",
                "prompt-engineering"
            ]
        )

        # Create portfolio from analysis results
        try:
            portfolio_id = portfolio_service.create_portfolio_from_analysis(
                analysis_result,
                resume.filename if resume.filename else "resume"
            )
            response.metadata = response.metadata or {}
            response.metadata["portfolio_id"] = portfolio_id
        except Exception as e:
            logger = logging.getLogger(__name__)
            logger.warning(f"Could not create portfolio: {str(e)}")

        return response

    except Exception as e:
        # Clean up temporary file in case of error
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing AI PM resume: {str(e)}"
        )
@app.post("/analyze-job-description")
async def analyze_job_description(
    job_description: str = Form(...),
    target_role: str = Form("senior"),
    industry: str = Form("technology")
) -> JobDescriptionAnalysis:
    """
    Analyze job description for AI PM roles.

    Args:
        job_description: Job description text
        target_role: Target role level
        industry: Industry sector

    Returns:
        JobDescriptionAnalysis with required skills and recommendations
    """
    # Basic job description analysis
    # This would typically use OpenRouter API for detailed analysis

    # Extract skills from job description
    job_skills = analyzer.extract_ai_pm_skills(job_description)

    # Determine target level
    position_level = position_level_detection(target_role, job_description)

    # Generate industry-specific recommendations
    industry_recommendations = get_industry_recommendations(industry, job_description)

    return JobDescriptionAnalysis(
        target_level=position_level,
        required_skills=job_skills,
        industry_keywords=industry_recommendations,
        career_level=position_level,
        competitive_level=calculate_competitive_level(job_description, target_role),
        compensation_range=get_compensation_range(target_role, industry),
        responsibilities=extract_responsibilities(job_description),
        tools_mentioned=extract_tools(job_description)
    )
@app.get("/learning-modules")
async def get_learning_modules(
    level: str = "all",
    module_type: str = "all",
    skills_to_develop: str = ""
) -> Dict[str, Any]:
    """
    Get available learning modules for AI PM development.

    Args:
        level: Experience level filter
        module_type: Module type filter
        skills_to_develop: Comma-separated skills to focus on

    Returns:
        Dict of learning modules organized by category
    """
    # Generate learning modules based on analysis
    modules_by_category = {
        "Technical Skills": generate_technical_modules(level, skills_to_develop),
        "AI/ML Expertise": generate_ai_ml_modules(level),
        "Product Management": generate_product_management_modules(level),
        "Leadership Skills": generate_leadership_modules(level),
        "Prompt Engineering": generate_prompt_engineering_modules(level),
        "Industry-Specific": generate_industry_modules(level)
    }

    return {
        "modules": modules_by_category,
        "total_modules": sum(len(module_list) for module_list in modules_by_category.values()),
        "next_available_modules": ["Technical Deep Dive", "Prompt Engineering Mastery", "AI Product Strategy"]
    }
@app.get("/prompt-engineering-tools")
async def get_prompt_tools():
    """Get available prompt engineering tools and templates."""
    tools = [
        {
            "name": "AI PM Role Interview",
            "template": "You are an AI Product Manager interviewing for a {role} position. "
                       "Focus on: {questions} with specific metrics and examples.",
            "category": "Interview Preparation",
            "use_case": "Preparing for AI PM job interviews",
            "examples": [
                {
                    "prompt": "Tell me about a time you successfully integrated AI into a product",
                    "response": "I led a cross-functional team to deploy a recommendation system..."
                }
            ]
        }
    ]
    return tools

# Portfolio API Endpoints
@app.post("/portfolios/create")
async def create_portfolio(
    user_id: str,
    title: str,
    subtitle: str,
    bio: str,
    headline: str,
    is_public: bool = True
) -> Dict[str, Any]:
    """
    Create a new portfolio for a user.

    Args:
        user_id: User ID
        title: Portfolio title
        subtitle: Portfolio subtitle
        bio: User bio
        headline: Professional headline
        is_public: Whether portfolio is public

    Returns:
        Created portfolio information
    """
    try:
        portfolio = portfolio_service.create_portfolio(
            user_id=user_id,
            title=title,
            subtitle=subtitle,
            bio=bio,
            headline=headline,
            is_public=is_public
        )

        return {
            "portfolio_id": portfolio.__dict__.get('id', str(uuid.uuid4())),
            "user_id": portfolio.user_id,
            "title": portfolio.title,
            "subtitle": portfolio.subtitle,
            "bio": portfolio.bio,
            "headline": portfolio.headline,
            "is_public": portfolio.is_public,
            "portfolio_url": portfolio.portfolio_url,
            "created_at": portfolio.created_at.isoformat() if hasattr(portfolio, 'created_at') else time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating portfolio: {str(e)}")
@app.get("/portfolios/{portfolio_id}")
async def get_portfolio(portfolio_id: str) -> Dict[str, Any]:
    """
    Get portfolio information by ID.

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Portfolio information
    """
    try:
        portfolio = portfolio_service.portfolios.get(portfolio_id)
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")

        return {
            "portfolio_id": portfolio_id,
            "user_id": portfolio.user_id,
            "title": portfolio.title,
            "subtitle": portfolio.subtitle,
            "bio": portfolio.bio,
            "headline": portfolio.headline,
            "location": portfolio.location if hasattr(portfolio, 'location') else None,
            "profile_image_url": portfolio.profile_image_url if hasattr(portfolio, 'profile_image_url') else None,
            "is_public": portfolio.is_public,
            "portfolio_url": portfolio.portfolio_url if hasattr(portfolio, 'portfolio_url') else None,
            "theme": portfolio.theme if hasattr(portfolio, 'theme') else None,
            "created_at": portfolio.created_at.isoformat() if hasattr(portfolio, 'created_at') else None,
            "updated_at": portfolio.updated_at.isoformat() if hasattr(portfolio, 'updated_at') else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving portfolio: {str(e)}")
@app.get("/portfolios/{portfolio_id}/showcase")
async def get_portfolio_showcase(portfolio_id: str) -> Dict[str, Any]:
    """
    Get portfolio showcase data.

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Complete showcase data for the portfolio
    """
    try:
        showcase_data = portfolio_service.get_portfolio_showcase_data(portfolio_id)
        return showcase_data
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating portfolio showcase: {str(e)}")
@app.post("/portfolios/{portfolio_id}/projects")
async def add_project_to_portfolio(
    portfolio_id: str,
    title: str,
    description: str,
    project_type: str,
    technologies: List[str] = None,
    project_url: str = None,
    github_url: str = None,
    images: List[str] = None
) -> Dict[str, Any]:
    """
    Add a project to a portfolio.

    Args:
        portfolio_id: Portfolio ID
        title: Project title
        description: Project description
        project_type: Project type
        technologies: Technologies used
        project_url: Live project URL
        github_url: GitHub repository URL
        images: Project images

    Returns:
        Created project information
    """
    try:
        if technologies is None:
            technologies = []
        if images is None:
            images = []

        project = portfolio_service.add_project(
            portfolio_id=portfolio_id,
            title=title,
            description=description,
            project_type=project_type,
            technologies=technologies,
            project_url=project_url,
            github_url=github_url,
            images=images
        )

        return {
            "project_id": project.__dict__.get('id', str(uuid.uuid4())),
            "portfolio_id": project.portfolio_id,
            "title": project.title,
            "description": project.description,
            "project_type": project.project_type,
            "technologies": project.technologies,
            "project_url": project.project_url,
            "github_url": project.github_url,
            "images": project.images,
            "order": project.order,
            "ai_summary": project.ai_summary if hasattr(project, 'ai_summary') else None,
            "created_at": project.created_at if hasattr(project, 'created_at') else time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding project: {str(e)}")
@app.get("/portfolios/{portfolio_id}/analyze")
async def analyze_portfolio_for_application(portfolio_id: str) -> Dict[str, Any]:
    """
    Analyze portfolio for job applications.

    Args:
        portfolio_id: Portfolio ID

    Returns:
        Application-focused portfolio analysis
    """
    try:
        analysis = portfolio_service.analyze_portfolio_for_application(portfolio_id)
        return analysis
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing portfolio: {str(e)}")
@app.post("/portfolios/create-from-analysis")
async def create_portfolio_from_analysis(
    resume_filename: str = Form(...),
    analysis_data: Dict[str, Any] = Form(...)  # Would need proper Pydantic model
) -> Dict[str, Any]:
    """
    Create portfolio from AI-powered resume analysis.

    Args:
        resume_filename: Original resume filename
        analysis_data: AI analysis results

    Returns:
        Created portfolio information
    """
    try:
        # This would integrate with the actual resume analysis service
        # For now, create a basic portfolio from analysis data
        portfolio = portfolio_service.create_portfolio(
            user_id="ai-analysis-user",
            title=f"AI PM Portfolio: {resume_filename}",
            subtitle="Generated from AI-powered analysis",
            bio="Portfolio created through AI-powered resume analysis",
            headline="AI Product Manager",
            is_public=True
        )

        # Add achievements based on analysis data
        if "skills" in analysis_data:
            for skill in analysis_data["skills"][:3]:
                portfolio_service.add_achievement(
                    portfolio_id=portfolio_id,
                    title=f"Mastery of {skill['name']}",
                    organization="AI Learning Platform",
                    description=f"Demonstrated expertise in {skill['name']} through analysis",
                    achievement_type="skill_certification",
                    date_earned=datetime.now(),
                    skills_acquired=[skill['name']]
                )

        return {
            "portfolio_id": portfolio.__dict__.get('id', str(uuid.uuid4())),
            "title": portfolio.title,
            "subtitle": portfolio.subtitle,
            "bio": portfolio.bio,
            "headline": portfolio.headline,
            "is_public": portfolio.is_public,
            "portfolio_url": portfolio.portfolio_url,
            "created_from": "ai_resume_analysis",
            "ai_analysis_applied": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating portfolio from analysis: {str(e)}")
@app.get("/portfolios/{portfolio_id}/export/{export_format}")
async def export_portfolio(
    portfolio_id: str,
    export_format: str,
    include_ai_insights: bool = True
) -> Dict[str, Any]:
    """
    Export portfolio data.

    Args:
        portfolio_id: Portfolio ID
        export_format: Export format (json, html, pdf)
        include_ai_insights: Include AI insights

    Returns:
        Export information
    """
    try:
        export = portfolio_service.generate_portfolio_export(
            portfolio_id=portfolio_id,
            export_format=export_format,
            include_ai_insights=include_ai_insights
        )

        return {
            "export_id": export.export_id,
            "portfolio_id": export.portfolio_id,
            "export_format": export.export_format,
            "generated_at": export.generated_at.isoformat(),
            "file_path": export.file_path,
            "download_count": export.download_count,
            "export_data_size": len(str(export.export_data)) if export.export_data else 0
        }
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error exporting portfolio: {str(e)}")
@app.put("/portfolios/{portfolio_id}")
async def update_portfolio(
    portfolio_id: str,
    title: str = None,
    subtitle: str = None,
    bio: str = None,
    headline: str = None,
    location: str = None
) -> Dict[str, Any]:
    """
    Update portfolio information.

    Args:
        portfolio_id: Portfolio ID
        title: New title
        subtitle: New subtitle
        bio: New bio
        headline: New headline
        location: New location

    Returns:
        Updated portfolio information
    """
    try:
        kwargs = {}
        if title is not None:
            kwargs['title'] = title
        if subtitle is not None:
            kwargs['subtitle'] = subtitle
        if bio is not None:
            kwargs['bio'] = bio
        if headline is not None:
            kwargs['headline'] = headline
        if location is not None:
            kwargs['location'] = location

        if not kwargs:
            raise HTTPException(status_code=400, detail="No fields to update")

        portfolio = portfolio_service.update_portfolio(portfolio_id, **kwargs)

        return {
            "portfolio_id": portfolio_id,
            "updated_fields": list(kwargs.keys()),
            "updated_at": portfolio.updated_at.isoformat() if hasattr(portfolio, 'updated_at') else time.strftime("%Y-%m-%d %H:%M:%S"),
            "message": "Portfolio updated successfully"
        }
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating portfolio: {str(e)}")
@app.post("/portfolios/{portfolio_id}/achievements")
async def add_achievement_to_portfolio(
    portfolio_id: str,
    title: str,
    organization: str,
    description: str,
    achievement_type: str,
    date_earned: str,
    skills_acquired: List[str] = None
) -> Dict[str, Any]:
    """
    Add an achievement to a portfolio.

    Args:
        portfolio_id: Portfolio ID
        title: Achievement title
        organization: Issuing organization
        description: Achievement description
        achievement_type: Type of achievement
        date_earned: Date earned (ISO format)
        skills_acquired: Skills acquired

    Returns:
        Created achievement information
    """
    try:
        if skills_acquired is None:
            skills_acquired = []

        try:
            date_earned_dt = datetime.fromisoformat(date_earned.replace('Z', '+00:00'))
        except:
            date_earned_dt = datetime.now()

        achievement = portfolio_service.add_achievement(
            portfolio_id=portfolio_id,
            title=title,
            organization=organization,
            description=description,
            achievement_type=achievement_type,
            date_earned=date_earned_dt,
            skills_acquired=skills_acquired
        )

        return {
            "achievement_id": achievement.achievement_id,
            "portfolio_id": achievement.portfolio_id,
            "title": achievement.title,
            "organization": achievement.organization,
            "description": achievement.description,
            "achievement_type": achievement.achievement_type,
            "date_earned": achievement.date_earned.isoformat(),
            "skills_acquired": achievement.skills_acquired,
            "is_verified": achievement.is_verified
        }
    except PortfolioGenerationError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding achievement: {str(e)}")