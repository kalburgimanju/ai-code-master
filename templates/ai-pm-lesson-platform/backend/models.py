"""
Backward compatibility module for AI PM portfolio data models.

This file provides legacy imports for portfolio models to support existing code.
New code should import from core.models instead.
"""

from .core.models import (
    AIMPSkill,
    AIMPLesson,
    LearningModule,
    ResumeAnalysis,
    JobDescriptionAnalysis,
    PromptEngineeringTool,
    AIMPAnalysisResult,
    UserProgress,
    PositionLevel,
    ModuleType,
    ScoreBreakdown,
    Portfolio,
    PortfolioProject,
    PortfolioSettings,
    UserPortfolio,
    PortfolioAchievement,
    PortfolioExport,
    PortfolioTemplate,
    SkillProgress,
    IndustryInsight,
    PortfolioVersion,
)

# Provide references to the same classes
Portfolio = Portfolio
PortfolioProject = PortfolioProject
PortfolioSettings = PortfolioSettings
UserPortfolio = UserPortfolio
PortfolioAchievement = PortfolioAchievement
PortfolioExport = PortfolioExport
PortfolioTemplate = PortfolioTemplate
SkillProgress = SkillProgress
IndustryInsight = IndustryInsight
PortfolioVersion = PortfolioVersion
ResumeAnalysis = ResumeAnalysis
AIMPSkill = AIMPSkill
AIMPAnalysisResult = AIMPAnalysisResult
LearningModule = LearningModule
UserProgress = UserProgress