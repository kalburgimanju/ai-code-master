"""
Data models for AI Product Manager Learning Platform.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum

class PositionLevel(str, Enum):
    """AI PM experience levels"""
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    PRINCIPAL = "principal"
    EXECUTIVE = "executive"
    AUTO_DETECT = "auto"

class ModuleType(str, Enum):
    """Learning module types"""
    FOUNDATIONS = "foundations"
    TECHNICAL = "technical"
    PROMPT_ENGINEERING = "prompt-engineering"
    LEADERSHIP = "leadership"
    MARKETING = "marketing"

@dataclass
class AIMPSkill:
    """AI Product Manager specific skills"""
    category: str
    skill: str
    importance: str
    relevance_score: float = 0.0
    acquisition_difficulty: str = "medium"

@dataclass
class AIMPLesson:
    """Individual lesson in learning modules"""
    title: str
    module_type: ModuleType
    description: str
    order: int
    duration_minutes: int
    learning_objectives: List[str] = field(default_factory=list)
    content: Dict[str, Any] = field(default_factory=dict)
    practice_prompt: Optional[str] = None
    assessment_type: str = "quiz"

@dataclass
class LearningModule:
    """Complete learning module for AI PM skills"""
    title: str
    module_type: ModuleType
    description: str
    estimated_hours: float = 2.0
    lessons: List[AIMPLesson] = field(default_factory=list)
    prerequisites: List[str] = field(default_factory=list)
    outcome: str
    industry_relevance: float = 0.0

@dataclass
class ResumeAnalysis:
    """Complete AI PM resume analysis result"""
    ats_score: float
    technical_assessment_score: float
    product_management_score: float
    ai_ml_expertise_score: float
    prompt_engineering_score: float
    leadership_score: float
    industry_alignment_score: float
    ai_pm_specific_score: float
    missing_aitpm_keywords: List[str] = field(default_factory=list)
    suggested_skills: List[AIMPSkill] = field(default_factory=list)
    recommended_modules: List[LearningModule] = field(default_factory=list)
    improvement_suggestions: List[str] = field(default_factory=list)
    career_readiness_score: float = 0.0
    next_role_probability: float = 0.0
    sector_recommendations: List[str] = field(default_factory=list)
    tools_to_learn: List[str] = field(default_factory=list)
    analysis_date: datetime = field(default_factory=datetime.now)

@dataclass
class JobDescriptionAnalysis:
    """Job description analysis for AI PM roles"""
    target_level: PositionLevel
    required_skills: List[AIMPSkill] = field(default_factory=list)
    industry_keywords: List[str] = field(default_factory=list)
    career_level: str
    competitive_level: str
    compensation_range: Optional[Dict[str, Any]] = None
    responsibilities: List[str] = field(default_factory=list)
    tools_mentioned: List[str] = field(default_factory=list)

@dataclass
class PromptEngineeringTool:
    """Prompt engineering templates and examples"""
    name: str
    template: str
    category: str
    use_case: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    examples: List[Dict[str, str]] = field(default_factory=list)
    best_practices: List[str] = field(default_factory=list)

@dataclass
class AIMPAnalysisResult:
    """Complete AI PM focused analysis result"""
    success: bool
    message: str
    learning_modules: List[LearningModule] = field(default_factory=list)
    prompt_tools: List[PromptEngineeringTool] = field(default_factory=list)
    recommended_journal_sources: List[str] = field(default_factory=list)
    skill_gap_analysis: Dict[str, float] = field(default_factory=dict)
    development_roadmap: List[Dict[str, Any]] = field(default_factory=list)
    immediate_actions: List[str] = field(default_factory=list)
    platform_features_used: List[str] = field(default_factory=list)

# Portfolio Models
@dataclass
class Portfolio:
    """Complete professional portfolio for AI PM career"""
    user_id: str
    title: str
    subtitle: str
    bio: str
    headline: str
    location: Optional[str] = None
    profile_image_url: Optional[str] = None
    portfolio_url: str = field(default_factory=lambda: f"/{uuid.uuid4().hex[:8]}")
    is_public: bool = True
    theme: str = "professional"
    custom_css: Optional[str] = None

    # Timestamps
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    last_accessed: Optional[datetime] = None

@dataclass
class PortfolioProject:
    """AI PM project showcase"""
    portfolio_id: str
    title: str
    description: str
    project_type: str
    technologies: List[str] = field(default_factory=list)
    project_url: Optional[str] = None
    github_url: Optional[str] = None
    thumbnails: List[str] = field(default_factory=list)
    images: List[str] = field(default_factory=list)
    impact_metrics: Dict[str, Any] = field(default_factory=dict)
    ai_summary: str = field(default_factory=str)
    featured: bool = False
    order: int = 0

@dataclass
class PortfolioSettings:
    """Portfolio customization settings"""
    portfolio_id: str
    theme: str = "professional"
    custom_css: Optional[str] = None
    show_email: bool = True
    show_phone: bool = True
    show_location: bool = True
    show_social_links: bool = True
    achievements_first: bool = False
    highlights_section: bool = True

@dataclass
class UserPortfolio:
    """User portfolio with AI insights"""
    portfolio_id: str
    user_id: str
    skills_summary: Dict[str, Any] = field(default_factory=dict)
    industry_focus: List[str] = field(default_factory=list)
    career_level: str = field(default_factory=lambda: "auto")
    target_roles: List[str] = field(default_factory=list)
    unique_selling_points: List[str] = field(default_factory=list)
    customization_preferences: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PortfolioAchievement:
    """Professional achievement or certification"""
    achievement_id: str
    portfolio_id: str
    title: str
    organization: str
    description: str
    achievement_type: str
    date_earned: datetime
    verification_url: Optional[str] = None
    certificate_url: Optional[str] = None
    skills_acquired: List[str] = field(default_factory=list)
    is_verified: bool = True
    ai_insights: Optional[Dict[str, str]] = None

@dataclass
class PortfolioExport:
    """Portfolio export state"""
    export_id: str
    portfolio_id: str
    export_format: str
    generated_at: datetime
    export_data: Dict[str, Any] = field(default_factory=dict)
    file_path: Optional[str] = None
    download_count: int = 0
    last_downloaded: Optional[datetime] = None

@dataclass
class PortfolioTemplate:
    """Portfolio template for quick creation"""
    template_id: str
    name: str
    description: str
    thumbnail_url: str
    category: str
    is_premium: bool = False
    customization_options: Dict[str, Any] = field(default_factory=dict)
    is_default: bool = False

@dataclass
class SkillProgress:
    """AI PM skill progress tracking"""
    progress_id: str
    user_id: str
    skill_name: str
    category: str
    current_level: str
    target_level: str
    progress_percentage: float
    last_assessment_date: datetime
    next_assessment_date: Optional[datetime] = None
    assessment_score: Optional[float] = None
    learning_resources_used: List[str] = field(default_factory=list)
    notes: Optional[str] = None

@dataclass
class IndustryInsight:
    """Industry-specific insights for AI PM portfolio"""
    insight_id: str
    user_id: str
    industry: str
    market_trends: List[str] = field(default_factory=list)
    key_skills_demand: List[str] = field(default_factory=list)
    salary_ranges: Dict[str, Any] = field(default_factory=dict)
    company_insights: List[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)
    data_sources: List[str] = field(default_factory=list)

@dataclass
class PortfolioVersion:
    """Portfolio version history"""
    version_id: str
    portfolio_id: str
    version_number: int
    changes: Dict[str, Any] = field(default_factory=dict)
    created_by: str = "system"
    created_at: datetime = field(default_factory=datetime.now)
    change_summary: Optional[str] = None
    is_published: bool = False

@dataclass
class UserProgress:
    """User progress tracking"""
    user_id: str
    completed_modules: List[str] = field(default_factory=list)
    completed_lessons: List[str] = field(default_factory=list)
    skill_scores: Dict[str, float] = field(default_factory=dict)
    resume_analysis_history: List[ResumeAnalysis] = field(default_factory=list)
    last_accessed: datetime = field(default_factory=datetime.now)
    certificates_earned: List[str] = field(default_factory=list)
    career_goals: Optional[Dict[str, Any]] = None
    portfolio_id: Optional[str] = None