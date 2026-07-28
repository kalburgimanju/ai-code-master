"""
Portfolio Management Service for AI PM Learning Platform

This service handles portfolio creation, management, and AI-powered content generation.
It integrates with the existing resume analysis to create professional portfolios.
"""

import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import asdict
import asyncio
import logging

from core.models import (
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
    ResumeAnalysis,
    AIMPSkill,
    AIMPAnalysisResult,
    LearningModule,
    UserProgress
)

logger = logging.getLogger(__name__)

class PortfolioGenerationError(Exception):
    """Raised when portfolio generation fails"""
    pass

class PortfolioManagementService:
    """
    Comprehensive service for managing AI PM portfolios.
    Handles portfolio creation, project management, skill tracking, and AI-powered content generation.
    """

    def __init__(self):
        self.portfolios: Dict[str, Portfolio] = {}
        self.portfolio_projects: Dict[str, PortfolioProject] = {}
        self.portfolio_settings: Dict[str, PortfolioSettings] = {}
        self.user_portfolios: Dict[str, UserPortfolio] = {}
        self.portfolio_achievements: Dict[str, PortfolioAchievement] = {}
        self.skill_progresses: Dict[str, SkillProgress] = {}
        self.industry_insights: Dict[str, IndustryInsight] = {}
        self.portfolio_versions: Dict[str, PortfolioVersion] = {}

    def create_portfolio(self, user_id: str, title: str, subtitle: str, bio: str,
                       headline: str, is_public: bool = True) -> Portfolio:
        """
        Create a new portfolio for a user.

        Args:
            user_id: User ID creating the portfolio
            title: Portfolio title
            subtitle: Portfolio subtitle
            bio: User biography
            headline: Professional headline
            is_public: Whether the portfolio is publicly visible

        Returns:
            Created portfolio object
        """
        try:
            portfolio_id = str(uuid.uuid4())
            portfolio = Portfolio(
                user_id=user_id,
                title=title,
                subtitle=subtitle,
                bio=bio,
                headline=headline,
                is_public=is_public
            )

            self.portfolios[portfolio_id] = portfolio

            # Create default settings
            settings = PortfolioSettings(portfolio_id=portfolio_id)
            self.portfolio_settings[portfolio_id] = settings

            # Create user portfolio insights
            user_portfolio = UserPortfolio(portfolio_id=portfolio_id, user_id=user_id)
            self.user_portfolios[portfolio_id] = user_portfolio

            logger.info(f"Portfolio created: {portfolio_id} for user {user_id}")
            return portfolio

        except Exception as e:
            logger.error(f"Error creating portfolio for user {user_id}: {str(e)}")
            raise PortfolioGenerationError(f"Failed to create portfolio: {str(e)}")

    def update_portfolio(self, portfolio_id: str, **kwargs) -> Portfolio:
        """
        Update portfolio information.

        Args:
            portfolio_id: Portfolio ID to update
            **kwargs: Fields to update

        Returns:
            Updated portfolio object

        Raises:
            PortfolioGenerationError: If portfolio not found
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        portfolio = self.portfolios[portfolio_id]

        # Update allowed fields
        updatable_fields = ['title', 'subtitle', 'bio', 'headline', 'location',
                           'profile_image_url', 'is_public', 'theme', 'custom_css']

        for field, value in kwargs.items():
            if field in updatable_fields and hasattr(portfolio, field):
                setattr(portfolio, field, value)

        portfolio.updated_at = datetime.now()
        self.portfolios[portfolio_id] = portfolio

        # Add version entry
        self._create_portfolio_version(portfolio_id, "Updated portfolio information")

        logger.info(f"Portfolio {portfolio_id} updated")
        return portfolio

    def add_project(self, portfolio_id: str, title: str, description: str,
                   project_type: str, technologies: List[str] = None,
                   project_url: str = None, github_url: str = None,
                   images: List[str] = None) -> PortfolioProject:
        """
        Add a project to a portfolio.

        Args:
            portfolio_id: Portfolio ID to add project to
            title: Project title
            description: Project description
            project_type: Type of project
            technologies: List of technologies used
            project_url: Live project URL
            github_url: GitHub repository URL
            images: Project images

        Returns:
            Created project object

        Raises:
            PortfolioGenerationError: If portfolio not found
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        project_id = str(uuid.uuid4())
        technologies = technologies or []
        images = images or []

        project = PortfolioProject(
            portfolio_id=portfolio_id,
            title=title,
            description=description,
            project_type=project_type,
            technologies=technologies,
            project_url=project_url,
            github_url=github_url,
            images=images,
            order=len([p for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id])
        )

        self.portfolio_projects[project_id] = project
        self.portfolios[portfolio_id].updated_at = datetime.now()

        logger.info(f"Project added to portfolio {portfolio_id}: {project_id}")
        return project

    def generate_project_summary(self, project: PortfolioProject,
                               context_skills: List[AIMPSkill] = None) -> str:
        """
        Generate AI-powered summary for a project.

        Args:
            project: Project object
            context_skills: User's relevant skills for context

        Returns:
            AI-generated project summary
        """
        technologies_text = ", ".join(project.technologies) if project.technologies else "Various technologies"

        summary_components = [
            f"Project: {project.title}",
            f"Type: {project.project_type.replace('_', ' ').title()}",
            f"Technologies: {technologies_text}",
            f"Description: {project.description[:200]}..."
        ]

        if context_skills:
            relevant_skills = [skill.skill for skill in context_skills[:3]]
            if relevant_skills:
                summary_components.append(f"Built using relevant AI PM skills: {', '.join(relevant_skills)}")

        summary = ". ".join(summary_components) + "."
        return summary

    def analyze_portfolio_for_application(self, portfolio_id: str) -> Dict[str, Any]:
        """
        Analyze portfolio for job applications - identify strengths and opportunities.

        Args:
            portfolio_id: Portfolio ID to analyze

        Returns:
            Dictionary containing application-focused analysis

        Raises:
            PortfolioGenerationError: If portfolio not found
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        portfolio = self.portfolios[portfolio_id]
        user_portfolio = self.user_portfolios.get(portfolio_id)
        projects = [p for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id]
        achievements = [a for a in self.portfolio_achievements.values() if a.portfolio_id == portfolio_id]

        analysis = {
            'portfolio_strengths': [],
            'skill_gaps': [],
            'improvement_recommendations': [],
            'target_role_suitability': {},
            'industry_focus': [],
            'project_impact_score': 0.0,
            'certificate_count': len(achievements),
            'total_projects': len(projects),
            'ai_summary': ''
        }

        # Analyze project impact
        if projects:
            total_impact = sum(
                sum(project.impact_metrics.values()) if project.impact_metrics else 0
                for project in projects
            )
            project_count = len(projects)
            analysis['project_impact_score'] = min(100, (total_impact / project_count) if project_count > 0 else 0)

        # Identify portfolio strengths
        if portfolio.headline and 'AI' in portfolio.headline.upper():
            analysis['portfolio_strengths'].append('Strong AI focus in professional positioning')

        if len(projects) >= 3:
            analysis['portfolio_strengths'].append('Good project portfolio with diverse examples')

        if user_portfolio and user_portfolio.skills_summary:
            analysis['portfolio_strengths'].append('Documented skills and experience')

        # Industry focus from achievements
        for achievement in achievements:
            if 'AI' in achievement.title.upper() or 'ML' in achievement.title.upper():
                analysis['industry_focus'].append('Artificial Intelligence')
            elif 'Data' in achievement.title.upper():
                analysis['industry_focus'].append('Data Science')

        # Generate AI summary using OpenRouter
        try:
            summary = self._generate_portfolio_insights(portfolio_id, analysis)
            analysis['ai_summary'] = summary
        except Exception as e:
            logger.warning(f"Could not generate AI insights for portfolio {portfolio_id}: {str(e)}")

        return analysis

    def generate_portfolio_export(self, portfolio_id: str, export_format: str = "json",
                                 include_ai_insights: bool = True) -> PortfolioExport:
        """
        Generate a portfolio export.

        Args:
            portfolio_id: Portfolio ID to export
            export_format: Export format (json, html, pdf)
            include_ai_insights: Whether to include AI-generated insights

        Returns:
            Portfolio export object

        Raises:
            PortfolioGenerationError: If portfolio not found or unsupported format
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        if export_format not in ['json', 'html', 'pdf']:
            raise PortfolioGenerationError(f"Unsupported export format: {export_format}")

        export_id = str(uuid.uuid4())

        # Collect portfolio data
        export_data = {
            'portfolio': asdict(self.portfolios[portfolio_id]),
            'projects': [asdict(p) for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id],
            'achievements': [asdict(a) for a in self.portfolio_achievements.values() if a.portfolio_id == portfolio_id],
            'settings': asdict(self.portfolio_settings.get(portfolio_id)),
            'user_portfolio': asdict(self.user_portfolios.get(portfolio_id)),
            'export_timestamp': datetime.now().isoformat(),
            'portfolio_url': self.portfolios[portfolio_id].portfolio_url
        }

        if include_ai_insights:
            try:
                insights = self.analyze_portfolio_for_application(portfolio_id)
                export_data['ai_insights'] = insights
            except Exception as e:
                logger.warning(f"Could not generate AI insights for export: {str(e)}")

        export = PortfolioExport(
            export_id=export_id,
            portfolio_id=portfolio_id,
            export_format=export_format,
            generated_at=datetime.now(),
            export_data=export_data,
            file_path=f"exports/{portfolio_id}.{export_format}"
        )

        logger.info(f"Portfolio export created: {export_id} for portfolio {portfolio_id}")
        return export

    def add_achievement(self, portfolio_id: str, title: str, organization: str,
                         description: str, achievement_type: str, date_earned: datetime,
                         skills_acquired: List[str] = None) -> PortfolioAchievement:
        """
        Add an achievement or certification to a portfolio.

        Args:
            portfolio_id: Portfolio ID to add achievement to
            title: Achievement title
            organization: Issuing organization
            description: Achievement description
            achievement_type: Type of achievement
            date_earned: Date the achievement was earned
            skills_acquired: Skills gained from this achievement

        Returns:
            Created achievement object

        Raises:
            PortfolioGenerationError: If portfolio not found
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        achievement_id = str(uuid.uuid4())
        skills_acquired = skills_acquired or []

        achievement = PortfolioAchievement(
            achievement_id=achievement_id,
            portfolio_id=portfolio_id,
            title=title,
            organization=organization,
            description=description,
            achievement_type=achievement_type,
            date_earned=date_earned,
            skills_acquired=skills_acquired,
            is_verified=True,
            ai_insights={}
        )

        self.portfolio_achievements[achievement_id] = achievement
        self.portfolios[portfolio_id].updated_at = datetime.now()

        logger.info(f"Achievement added to portfolio {portfolio_id}: {achievement_id}")
        return achievement

    def track_skill_progress(self, user_id: str, skill_name: str, category: str,
                           current_level: str, target_level: str,
                           progress_percentage: float, assessment_score: float = None) -> SkillProgress:
        """
        Track and update skill progress for a user.

        Args:
            user_id: User ID
            skill_name: Name of the skill
            category: Skill category
            current_level: Current proficiency level
            target_level: Target proficiency level
            progress_percentage: Current progress (0-100)
            assessment_score: Latest assessment score (0-100)

        Returns:
            Created or updated skill progress object
        """
        progress_id = f"{user_id}_{skill_name.lower().replace(' ', '_')}"

        skill_progress = SkillProgress(
            progress_id=progress_id,
            user_id=user_id,
            skill_name=skill_name,
            category=category,
            current_level=current_level,
            target_level=target_level,
            progress_percentage=progress_percentage,
            last_assessment_date=datetime.now(),
            assessment_score=assessment_score
        )

        self.skill_progresses[progress_id] = skill_progress

        logger.info(f"Skill progress tracked: {user_id} - {skill_name}")
        return skill_progress

    def update_skill_progress(self, progress_id: str, current_level: str = None,
                            target_level: str = None, progress_percentage: float = None,
                            assessment_score: float = None) -> SkillProgress:
        """
        Update existing skill progress.

        Args:
            progress_id: Skill progress ID
            current_level: New current level
            target_level: New target level
            progress_percentage: New progress percentage
            assessment_score: New assessment score

        Returns:
            Updated skill progress object

        Raises:
            PortfolioGenerationError: If skill progress not found
        """
        if progress_id not in self.skill_progresses:
            raise PortfolioGenerationError(f"Skill progress {progress_id} not found")

        skill_progress = self.skill_progresses[progress_id]

        if current_level:
            skill_progress.current_level = current_level
        if target_level:
            skill_progress.target_level = target_level
        if progress_percentage is not None:
            skill_progress.progress_percentage = progress_percentage
        if assessment_score is not None:
            skill_progress.assessment_score = assessment_score

        skill_progress.last_assessment_date = datetime.now()

        logger.info(f"Skill progress updated: {progress_id}")
        return skill_progress

    def get_portfolio_showcase_data(self, portfolio_id: str) -> Dict[str, Any]:
        """
        Get complete showcase data for a portfolio.

        Args:
            portfolio_id: Portfolio ID to get showcase data for

        Returns:
            Dictionary containing all portfolio showcase data

        Raises:
            PortfolioGenerationError: If portfolio not found
        """
        if portfolio_id not in self.portfolios:
            raise PortfolioGenerationError(f"Portfolio {portfolio_id} not found")

        portfolio = self.portfolios[portfolio_id]
        projects = [p for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id]
        achievements = [a for a in self.portfolio_achievements.values() if a.portfolio_id == portfolio_id]
        settings = self.portfolio_settings.get(portfolio_id)
        user_portfolio = self.user_portfolios.get(portfolio_id)

        # Generate AI summaries for projects
        for project in projects:
            if not project.ai_summary:
                # Get user's relevant skills for context
                user_skills = []
                for skill_progress in self.skill_progresses.values():
                    if skill_progress.user_id == portfolio.user_id:
                        user_skills.append(
                            AIMPSkill(
                                category=skill_progress.category,
                                skill=skill_progress.skill_name,
                                importance='Medium'
                            )
                        )

                project.ai_summary = self.generate_project_summary(project, user_skills)

        showcase_data = {
            'portfolio': asdict(portfolio),
            'projects': [asdict(p) for p in projects],
            'achievements': [asdict(a) for a in achievements],
            'settings': asdict(settings) if settings else {},
            'user_portfolio': asdict(user_portfolio) if user_portfolio else {},
            'skill_progress': [asdict(sp) for sp in self.skill_progresses.values() if sp.user_id == portfolio.user_id],
            'total_view_count': 0,  # Would be tracked in production
            'last_updated': portfolio.updated_at.isoformat()
        }

        # Add portfolio health score
        showcase_data['portfolio_health_score'] = self._calculate_portfolio_health_score(portfolio_id)

        return showcase_data

    def simulate_ai_portfolio_analysis(self, resume_analysis: ResumeAnalysis) -> Dict[str, Any]:
        """
        Simulate AI-powered analysis of a resume to generate portfolio insights.

        Args:
            resume_analysis: Resume analysis result from AI PM analyzer

        Returns:
            AI-generated portfolio analysis and recommendations
        """
        # Analyze resume results to generate portfolio insights
        analysis = {
            'portfolio_theme': 'professional',
            'project_ideas': [],
            'skill_groups': {},
            'industry_focus': [],
            'careerrecommendations': [],
            'ai_insights': {}
        }

        # Generate project ideas based on extracted skills
        for skill in resume_analysis.suggested_skills[:5]:
            project_idea = f"Build a {skill.skill} project demonstrating {skill.importance.lower()} proficiency"
            analysis['project_ideas'].append(project_idea)

        # Group skills by category
        for skill in resume_analysis.extracted_skills:
            if skill.category not in analysis['skill_groups']:
                analysis['skill_groups'][skill.category] = []
            analysis['skill_groups'][skill.category].append(skill.skill)

        # Industry recommendations
        for sector in resume_analysis.sector_recommendations:
            if sector not in analysis['industry_focus']:
                analysis['industry_focus'].append(sector)

        # Career recommendations based on scores
        if resume_analysis.ai_pm_specific_score > 80:
            analysis['careerrecommendations'].append('Senior AI PM positions in leading tech companies')
        elif resume_analysis.ai_pm_specific_score > 60:
            analysis['careerrecommendations'].append('Mid-level AI PM roles with growth potential')

        # AI insights
        analysis['ai_insights'] = {
            'market_readiness': min(100, resume_analysis.ai_pm_specific_score + 10),
            'skill_demand_score': len(resume_analysis.suggested_skills),
            'industry_alignment_potential': len(resume_analysis.sector_recommendations),
            'career_jumpstart_recommendations': analysis['project_ideas'][:3]
        }

        return analysis

    def _create_portfolio_version(self, portfolio_id: str, change_summary: str):
        """
        Create a new version entry for portfolio changes.

        Args:
            portfolio_id: Portfolio ID
            change_summary: Summary of changes made
        """
        version_id = str(uuid.uuid4())
        version_number = len([v for v in self.portfolio_versions.values() if v.portfolio_id == portfolio_id]) + 1

        version = PortfolioVersion(
            version_id=version_id,
            portfolio_id=portfolio_id,
            version_number=version_number,
            changes={},
            created_by="user",
            created_at=datetime.now(),
            change_summary=change_summary,
            is_published=False
        )

        self.portfolio_versions[version_id] = version

    def _generate_portfolio_insights(self, portfolio_id: str, analysis: Dict[str, Any]) -> str:
        """
        Generate comprehensive insights for a portfolio using OpenRouter.

        Args:
            portfolio_id: Portfolio ID
            analysis: Portfolio analysis data

        Returns:
            AI-generated insights text
        """
        # This would integrate with OpenRouter API for AI insights
        # For now, return a structured summary
        insights = []

        if analysis['project_impact_score'] > 70:
            insights.append("Your project impact score is strong - you're building significant experience.")

        if analysis['certificate_count'] > 2:
            insights.append("You have excellent certification backing - great for credibility.")

        if 'Artificial Intelligence' in analysis['industry_focus']:
            insights.append("Strong focus on AI/ML - perfect for current market demand.")

        if len(insights) == 0:
            insights.append("Your portfolio shows good potential - consider adding more project details.")

        return ". ".join(insights) + "."

    def _calculate_portfolio_health_score(self, portfolio_id: str) -> float:
        """
        Calculate a health score for a portfolio.

        Args:
            portfolio_id: Portfolio ID

        Returns:
            Portfolio health score (0-100)
        """
        portfolio = self.portfolios.get(portfolio_id)
        if not portfolio:
            return 0.0

        score = 0.0
        weights = {}

        # Completeness (30%)
        completeness_score = 0
        if portfolio.bio and len(portfolio.bio) > 100:
            completeness_score += 25
        if portfolio.headline:
            completeness_score += 15
        if portfolio.location:
            completeness_score += 10

        if len([p for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id]) >= 2:
            completeness_score += 20
        if len([a for a in self.portfolio_achievements.values() if a.portfolio_id == portfolio_id]) >= 1:
            completeness_score += 10

        score += completeness_score * 0.3
        weights['completeness'] = completeness_score

        # Quality (40%)
        quality_score = 0
        projects = [p for p in self.portfolio_projects.values() if p.portfolio_id == portfolio_id]

        for project in projects:
            if project.description and len(project.description) > 50:
                quality_score += 10
            if project.technologies:
                quality_score += 5

        score += min(40, quality_score)
        weights['quality'] = min(40, quality_score)

        # SEO/Visibility (20%)
        visibility_score = 0
        if portfolio.is_public:
            visibility_score += 20

        if portfolio.portfoliop_url and len(portfolio.portfoliop_url) > 10:
            visibility_score += 10

        score += visibility_score
        weights['visibility'] = visibility_score

        # AI Optimization (10%)
        ai_score = 0
        if portfolio.bio and len(portfolio.bio) > 200:
            ai_score += 5

        if len([p for p in projects if p.ai_summary]) >= 1:
            ai_score += 5

        score += ai_score
        weights['ai'] = ai_score

        return min(100, score)