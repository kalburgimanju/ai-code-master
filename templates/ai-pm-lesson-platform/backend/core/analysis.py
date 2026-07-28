"""
Core AI Product Manager analysis logic.
Handles resume parsing, job description analysis, and scoring algorithms for AI PM roles.
"""

import json
import re
import numpy as np
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import defaultdict
import spacy

# Try to import sentence transformer with graceful fallback
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import nltk
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Install if not available
    import subprocess
    subprocess.run(["python", "-m", "pip", "install", "spacy"])
    subprocess.run(["python", "-c", "import spacy; spacy.cli.download('en_core_web_sm')"])
    nlp = spacy.load("en_core_web_sm")

# Create simple embeddings if sentence-transformers is not available
if not SENTENCE_TRANSFORMERS_AVAILABLE:
    class SimpleEmbedder:
        def encode(self, texts):
            # Create mock embeddings for AI PM analysis
            embeddings = []
            for text in texts:
                if not text:
                    embeddings.append(np.zeros(384, dtype=np.float32))
                    continue

                # Hash the text to create a semi-deterministic embedding
                # This simulates semantic similarity for AI PM skills
                text_hash = hash(text.encode('utf-8')) % 2**31
                np.random.seed(text_hash)
                embedding = np.random.randn(384).astype(np.float32)
                # Normalize to simulate semantic patterns
                embedding = embedding / np.linalg.norm(embedding + 1e-8)
                embeddings.append(embedding)

            return np.array(embeddings)

    embedder = SimpleEmbedder()
else:
    # Use real sentence transformers
    embedder = SentenceTransformer('all-MiniLM-L6-v2')

@dataclass
class ScoreBreakdown:
    """Detailed breakdown of AI PM scoring components."""
    technical_assessment: float = 0.0
    product_management: float = 0.0
    ai_ml_expertise: float = 0.0
    prompt_engineering: float = 0.0
    leadership_skills: float = 0.0
    industry_alignment: float = 0.0
    career_readiness: float = 0.0

@dataclass
class AIMPSkill:
    """AI Product Manager specific skill"""
    category: str
    skill: str
    importance: str
    relevance_score: float = 0.0
    acquisition_difficulty: str = "medium"

@dataclass
class ResumeAnalysis:
    """Complete AI PM resume analysis result."""
    ats_score: float
    score_breakdown: ScoreBreakdown
    extracted_skills: List[AIMPSkill] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    suggested_skills: List[AIMPSkill] = field(default_factory=list)
    recommended_learning_modules: List[str] = field(default_factory=list)
    industry_fit_score: float
    career_readiness_score: float
    next_role_probability: float
    recommended_modules: List[str] = field(default_factory=list)
    sector_recommendations: List[str] = field(default_factory=list)
    tools_to_learn: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    improvement_areas: List[str] = field(default_factory=list)
    analysis_date: datetime = field(default=datetime.now)
class AIResumeAnalyzer:
    """
    Main analyzer class for AI Product Manager resume evaluation.
    """

    def __init__(self):
        if NLTK_AVAILABLE:
            self.stop_words = set(stopwords.words('english'))
        else:
            self.stop_words = set([
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
                'you', 'your', 'yours', 'yourself', 'yourselves', 'he',
                'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
                'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
                'themselves', 'what', 'which', 'who', 'whom', 'this',
                'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were',
                'be', 'been', 'being', 'have', 'has', 'had', 'having',
                'do', 'does', 'did', 'doing', 'would', 'should', 'could',
                'may', 'might', 'must', 'can', 'will', 'shall'
            ])

        # AI PM specific scoring weights
        self.scoring_weights = {
            'technical_assessment': 0.20,
            'product_management': 0.25,
            'ai_ml_expertise': 0.20,
            'prompt_engineering': 0.15,
            'leadership_skills': 0.10,
            'industry_alignment': 0.10
        }

        # AI PM specific skill patterns
        self.ai_pm_skills = [
            r'\bPython\b', r'\bJavaScript\b', r'\bTypeScript\b', r'\bReact\b',
            r'\bNode\.js\b', r'\bExpress\b', r'\bNext\.js\b', r'\bVue\b',
            r'\bMachine Learning\b', r'\bDeep Learning\b', r'\bAI\b',
            r'\bLLMs\b', r'\bPrompt Engineering\b', r'\bNLP\b',
            r'\bComputer Vision\b', r'\bTensorFlow\b', r'\bPyTorch\b',
            r'\bOpenAI API\b', r'\bClaude\b', r'\bLlama\b', r'\bGemini\b',
            r'\bAWS\b', r'\bAzure\b', r'\bGCP\b', r'\bDocker\b',
            r'\bKubernetes\b', r'\bREST API\b', r'\bMicroservices\b',
            r'\bAgriTech\b', r'\bFinTech\b', r'\bHealthTech\b',
            r'\bEduTech\b', r'\bLegalTech\b', r'\bAdTech\b'
        ]

        # AI PM leadership patterns
        self.leadership_patterns = [
            r'\bProduct Manager\b', r'\bSenior Product Manager\b', r'\bLead Product Manager\b',
            r'\bPrincipal Product Manager\b', r'\bHead of Product\b', r'\bVP of Product\b',
            r'\bCTO\b', r'\bChief Technology Officer\b', r'\bTech Lead\b',
            r'\bEngineering Manager\b', r'\bEngineering Lead\b'
        ]

        # AI PM specific industry keywords
        self.ai_pm_industry_keywords = [
            'AI', 'ML', 'Machine Learning', 'Deep Learning', 'Neural Networks',
            'Prompt Engineering', 'LLM', 'Large Language Models', 'Generative AI',
            'Computer Vision', 'NLP', 'Natural Language Processing', 'Vision AI',
            'AgriTech', 'FinTech', 'HealthTech', 'EduTech', 'LegalTech', 'AdTech',
            'Prompt Engineering', 'AI Product', 'Product AI', 'ML Product',
            'AI/ML', 'Machine Intelligence', 'AI Solutions', 'ML Solutions'
        ]

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ''
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n'
                return text
        except ImportError:
            raise ImportError("PyPDF2 is required for PDF processing")

    def extract_text_from_docx(self, docx_path: str) -> str:
        """Extract text from DOCX file."""
        try:
            import docx
            doc = docx.Document(docx_path)
            text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except ImportError:
            raise ImportError("python-docx is required for DOCX processing")

    def extract_text_from_txt(self, txt_path: str) -> str:
        """Extract text from TXT file."""
        with open(txt_path, 'r', encoding='utf-8') as file:
            return file.read()

    def preprocess_text(self, text: str) -> str:
        """Preprocess text for AI PM analysis."""
        if not text:
            return ""

        # Clean up text
        text = re.sub(r'\s+', ' ', text)  # Remove extra whitespace
        text = text.strip()  # Strip leading/trailing whitespace

        # Extract and clean keywords/phrases
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  # Remove URLs
        text = re.sub(r'\@\w+|\#\w+', '', text)  # Remove mentions and hashtags
        text = re.sub(r'\\n+', ' ', text)  # Remove excessive newlines

        return text

    def extract_ai_pm_skills(self, text: str) -> List[AIMPSkill]:
        """Extract AI PM specific skills from text using advanced NLP."""
        skills = []

        # Use spaCy for named entity recognition
        if nlp:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in ['PRODUCT', 'LANGUAGE', 'SKILL', 'WORK_TOOL', 'TECHNOLOGY']:
                    # Classify skill into category
                    category = self._categorize_skill(ent.text)
                    importance = self._assess_skill_importance(ent.text)

                    skills.append(AIMPSkill(
                        category=category,
                        skill=ent.text,
                        importance=importance,
                        relevance_score=0.7
                    ))

        # Extract skills using advanced regex patterns
        for pattern in self.ai_pm_skills:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                category = self._categorize_skill(match)
                importance = self._assess_skill_importance(match)

                skills.append(AIMPSkill(
                    category=category,
                    skill=match,
                    importance=importance,
                    relevance_score=0.8
                ))

        # Extract leadership experience
        for pattern in self.leadership_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                skills.append(AIMPSkill(
                    category='Leadership',
                    skill=match,
                    importance='High',
                    relevance_score=0.9
                ))

        # AI PM specific skill combinations (multi-word)
        combined_patterns = [
            r'\b(AgriTech|FinTech|HealthTech|EduTech|LegalTech|AdTech)\b',
            r'\b(Prompt Engineering|Large Language Models|Machine Learning)\b',
            r'\b(Computer Vision|NLP|Natural Language Processing)\b',
            r'\b(AI|ML) (Solutions|Products|Applications)\b'
        ]

        for pattern in combined_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                skills.append(AIMPSkill(
                    category='Domain Expertise',
                    skill=match,
                    importance='High',
                    relevance_score=0.85
                ))

        # Remove duplicates and normalize
        unique_skills = []
        seen = set()
        for skill in skills:
            skill_key = skill.skill.lower().strip()
            if skill_key not in seen and len(skill.skill) > 2:
                seen.add(skill_key)
                unique_skills.append(skill)

        # Sort by importance and relevance
        unique_skills.sort(key=lambda x: x.relevance_score, reverse=True)

        return unique_skills[:50]  # Limit to top 50 unique skills

    def _categorize_skill(self, skill_text: str) -> str:
        """Categorize AI PM skill into specific categories."""
        skill_lower = skill_text.lower()

        # Technical skills
        if any(x in skill_lower for x in ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'docker', 'kubernetes', 'aws', 'azure', 'gcp']):
            return 'Technical Skills'

        # AI/ML specific
        elif any(x in skill_lower for x in ['ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'computer vision', 'neural networks']):
            return 'AI/ML Expertise'

        # Product management
        elif any(x in skill_lower for x in ['product', 'agile', 'scrum', 'jira', 'trello']):
            return 'Product Management'

        # Leadership
        elif any(x in skill_lower for x in ['lead', 'management', 'leadership', 'team', 'strategic']):
            return 'Leadership Skills'

        # Tools and platforms
        elif any(x in skill_lower for x in ['prompt', 'engineering', 'git', 'rest', 'api']):
            return 'Tools & Platforms'

        # Industry specific
        elif any(x in skill_lower for x in ['fintech', 'healthtech', 'edutech', 'legalteach', 'adtech', 'agritech']):
            return 'Industry Expertise'

        else:
            return 'General Skills'

    def _assess_skill_importance(self, skill_text: str) -> str:
        """Assess importance level of AI PM skill."""
        skill_lower = skill_text.lower()

        # Critical for AI PM roles
        critical_skills = [
            'python', 'javascript', 'react', 'node', 'machine learning',
            'prompt engineering', 'llm', 'computer vision', 'docker',
            'kubernetes', 'aws', 'product manager', 'agile', 'scrum'
        ]

        # High importance skills
        high_importance = [
            'typescript', 'next.js', 'vue', 'tensorflow', 'pytorch',
            'scrum master', 'product lead', 'tech lead'
        ]

        if any(skill_lower in s for s in critical_skills):
            return 'Critical'
        elif any(skill_lower in s for s in high_importance):
            return 'High'
        else:
            return 'Medium'

    def extract_experience_level(self, text: str) -> str:
        """Extract AI PM experience level from text."""
        text_lower = text.lower()

        # Senior level indicators
        senior_indicators = [
            'senior product manager', 'lead product manager', 'principal product manager',
            'head of product', 'vp of product', 'director of product',
            '8+ years', '10+ years', '15+ years', '20+ years', 'extensive experience'
        ]

        # Mid-level indicators
        mid_level_indicators = [
            'mid-level product manager', 'intermediate product manager',
            '5+ years', '3+ years', '4+ years', '6+ years', '7+ years'
        ]

        # Entry level indicators
        junior_indicators = [
            'junior product manager', 'entry level product manager',
            '0-2 years', '1+ year', 'less than 3 years'
        ]

        # Check for indicators
        for indicator in senior_indicators:
            if indicator in text_lower:
                return 'Senior'

        for indicator in mid_level_indicators:
            if indicator in text_lower:
                return 'Mid-Level'

        for indicator in junior_indicators:
            if indicator in text_lower:
                return 'Junior'

        # Fallback: count years experience
        year_patterns = [
            r'(\d+)\+?\s*years?',
            r'(\d+)\+?\s*\+\s*years?'
        ]

        max_years = 0
        for pattern in year_patterns:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                years = int(match)
                if years > max_years:
                    max_years = years

        if max_years >= 8:
            return 'Senior'
        elif max_years >= 3:
            return 'Mid-Level'
        elif max_years >= 1:
            return 'Junior'
        else:
            return 'Entry Level'

    def calculate_ai_pm_comprehensive_score(self, resume_skills: List[AIMPSkill],
                                         job_required_skills: List[AIMPSkill]) -> Dict[str, Any]:
        """Calculate comprehensive AI PM scoring."""

        # Convert to sets for comparison
        resume_skill_names = set([skill.skill.lower().strip() for skill in resume_skills])
        job_skill_names = set([skill.skill.lower().strip() for skill in job_required_skills])

        # Calculate alignment scores
        matched_skills = resume_skill_names.intersection(job_skill_names)
        missing_skills = job_skill_names - resume_skill_names

        # Technical assessment score based on relevant skills
        technical_score = len(matched_skills) / len(job_skill_names) * 100 if job_skill_names else 0.0

        # Weight different skill categories for AI PM roles
        category_weights = {
            'Technical Skills': 0.25,
            'AI/ML Expertise': 0.30,
            'Product Management': 0.20,
            'Leadership Skills': 0.15,
            'Tools & Platforms': 0.10
        }

        # Calculate weighted score
        weighted_score = 0.0
        total_weight = 0.0

        matched_categories = defaultdict(int)
        for skill in resume_skills:
            category_weight = category_weights.get(skill.category, 0.1)
            matched_categories[skill.category] += category_weight
            total_weight += category_weight

        for category, weight in matched_categories.items():
            weighted_score += weight

        weighted_score = (weighted_score / total_weight * 100) if total_weight > 0 else 0.0

        # Industry alignment score
        industry_score = len(matched_skills) / max(len(job_skill_names), 1) * 100

        # Career readiness calculation (simplified)
        career_readiness = min(100, weighted_score * 1.2)

        # Next role probability calculation
        next_role_probability = min(100, (weighted_score * 0.8 + industry_score * 0.2))

        return {
            'technical_score': technical_score,
            'product_management_score': weighted_score,
            'industry_alignment_score': industry_score,
            'career_readiness_score': career_readiness,
            'next_role_probability': next_role_probability,
            'matched_skills': list(matched_skills),
            'missing_skills': list(missing_skills),
            'matched_categories': dict(matched_categories)
        }

    def analyze_resume(self, resume_text: str, job_description: str, position_level: str = "auto") -> ResumeAnalysis:
        """
        Comprehensive AI PM resume analysis.
        """
        # Preprocess texts
        resume_text = self.preprocess_text(resume_text)
        job_description = self.preprocess_text(job_description)

        # Extract information from resume
        resume_skills = self.extract_ai_pm_skills(resume_text)
        experience_level = self.extract_experience_level(resume_text)

        # Extract key requirements from job description
        job_required_skills = self.extract_ai_pm_skills(job_description)

        # Calculate comprehensive scoring
        scoring_results = self.calculate_ai_pm_comprehensive_score(resume_skills, job_required_skills)

        # Calculate individual component scores
        ai_pm_skills_count = len(resume_skills)
        matching_skills_percentage = (len(scoring_results['matched_skills']) /
                                     max(len(job_required_skills), 1)) * 100

        # Generate improvement suggestions
        improvement_suggestions = self.generate_improvement_suggestions(
            resume_skills, job_required_skills, scoring_results
        )

        # Determine suitable learning modules
        recommended_modules = self.get_recommended_learning_modules(
            experience_level, scoring_results, resume_skills
        )

        # Identify career sectors
        sector_recommendations = self.recommend_sectors(
            resume_skills, job_required_skills
        )

        # Calculate final scores
        scores = ScoreBreakdown(
            technical_assessment=scoring_results['technical_score'],
            product_management=scoring_results['product_management_score'],
            ai_ml_expertise=matching_skills_percentage,
            prompt_engineering=min(100, ai_pm_skills_count * 2),
            leadership_skills=min(100, len([s for s in resume_skills if s.category == 'Leadership Skills']) / max(1, len(resume_skills)) * 100),
            industry_alignment=scoring_results['industry_alignment_score'],
            career_readiness=scoring_results['career_readiness_score']
        )

        # Calculate weighted final score
        ats_score = (
            scores.technical_assessment * self.scoring_weights['technical_assessment'] +
            scores.product_management * self.scoring_weights['product_management'] +
            scores.ai_ml_expertise * self.scoring_weights['ai_ml_expertise'] +
            scores.prompt_engineering * self.scoring_weights['prompt_engineering'] +
            scores.leadership_skills * self.scoring_weights['leadership_skills'] +
            scores.industry_alignment * self.scoring_weights['industry_alignment']
        )

        # AI PM specific score adjustment
        ai_pm_specific_score = (ats_score + (
            len([s for s in resume_skills if 'AI' in s.skill or 'ML' in s.skill or 'Deep Learning' in s.skill]) * 10
        )) / 100 * 100

        # Generate improvement suggestions
        if scoring_results['missing_skills']:
            improvement_suggestions.extend([
                f"Add missing AI PM skills: {', '.join(list(scoring_results['missing_skills'])[:5])}",
                "Enhance experience with specific AI product examples",
                "Include relevant industry certifications and projects"
            ])

        # Extract strength areas
        strength_areas = []
        for category, count in scoring_results['matched_categories'].items():
            if count > 0.3:
                strength_areas.append(f"Strong {category.lower()} background")

        return ResumeAnalysis(
            ats_score=ats_score,
            score_breakdown=scores,
            extracted_skills=resume_skills,
            missing_keywords=list(scoring_results['missing_skills']),
            suggested_skills=self.generate_suggested_skills(
                job_required_skills, resume_skills, scoring_results
            ),
            recommended_learning_modules=recommended_modules,
            industry_fit_score=scoring_results['industry_alignment_score'],
            career_readiness_score=scoring_results['career_readiness_score'],
            next_role_probability=scoring_results['next_role_probability'],
            sector_recommendations=sector_recommendations,
            tools_to_learn=self.get_tools_to_learn(job_required_skills, resume_skills),
            strengths=strength_areas,
            improvement_areas=improvement_suggestions
        )

    def generate_improvement_suggestions(self, resume_skills: List[AIMPSkill],
                                       job_required_skills: List[AIMPSkill],
                                       scoring_results: Dict[str, Any]) -> List[str]:
        """Generate improvement suggestions based on analysis."""
        improvements = []

        # Missing critical skills
        if scoring_results['missing_skills']:
            critical_missing = [s for s in scoring_results['missing_skills']
                               if any(keyword in s.lower() for keyword in
                                     ['python', 'react', 'javascript', 'machine learning', 'prompt'])]
            if critical_missing:
                improvements.extend([
                    f"Add critical AI skills: {', '.join(critical_missing[:3])}",
                    "Build portfolio projects showcasing AI product work"
                ])

        # Weak skill categories
        weak_categories = [cat for cat, weight in scoring_results['matched_categories'].items()
                          if cat != 'Leadership Skills' and weight < 0.3]
        if weak_categories:
            improvements.append(f"Strengthen {', '.join(weak_categories)} skills")

        # Experience level recommendations
        improvements.extend([
            "Include specific metrics from previous AI product roles",
            "Showcase relevant industry experience and achievements",
            "Highlight cross-functional team leadership",
            "Demonstrate prompt engineering capabilities"
        ])

        return improvements[:10]

    def get_recommended_learning_modules(self, experience_level: str,
                                       scoring_results: Dict[str, Any],
                                       resume_skills: List[AIMPSkill]) -> List[str]:
        """Get recommended learning modules based on analysis."""
        modules = []

        # Module selection based on scoring
        if scoring_results['technical_score'] < 60:
            modules.extend(['Technical Deep Dive', 'Advanced Programming'])

        if scoring_results['product_management_score'] < 70:
            modules.extend(['Product Strategy Foundations', 'Agile Methodologies'])

        if scoring_results['ai_ml_expertise'] < 70:
            modules.extend(['Advanced ML Concepts', 'LLM Integration'])

        if scoring_results['prompt_engineering'] < 50:
            modules.extend(['Prompt Engineering Mastery', 'AI Product Design'])

        # Experience level specific modules
        if experience_level in ['Junior', 'Entry Level']:
            modules.extend(['AI PM Fundamentals', 'Career Development'])
        elif experience_level == 'Senior':
            modules.extend(['Leadership Excellence', 'Industry Strategy'])

        # Remove duplicates and limit to top recommendations
        unique_modules = list(set(modules))
        return unique_modules[:8]

    def recommend_sectors(self, resume_skills: List[AIMPSkill],
                        job_required_skills: List[AIMPSkill]) -> List[str]:
        """Recommend target sectors based on skills."""
        sector_skills = {
            'FinTech': ['FinTech', 'Financial', 'Banking', 'Trading', 'Cryptocurrency'],
            'HealthTech': ['HealthTech', 'Medical', 'Healthcare', 'BioTech', 'Digital Health'],
            'EduTech': ['EduTech', 'Education', 'Learning', 'Academic', 'Training'],
            'LegalTech': ['LegalTech', 'Legal', 'Compliance', 'RegTech', 'Law Tech'],
            'AdTech': ['AdTech', 'Advertising', 'Marketing', 'Digital Marketing'],
            'AgriTech': ['AgriTech', 'Agriculture', 'Farming', 'Crop', 'Food Tech'],
            'Real Estate Tech': ['Real Estate', 'Property', 'Construction', 'Housing']
        }

        recommended_sectors = []

        for sector, keywords in sector_skills.items():
            sector_skill_count = sum(1 for skill in resume_skills
                                   if any(keyword.lower() in skill.skill.lower() for keyword in keywords))
            if sector_skill_count > 0:
                recommended_sectors.append(sector)

        # If no specific sectors found, recommend general AI sectors
        if not recommended_sectors:
            recommended_sectors = ['FinTech', 'HealthTech', 'EduTech']

        return recommended_sectors[:5]

    def get_tools_to_learn(self, job_required_skills: List[AIMPSkill],
                          resume_skills: List[AIMPSkill]) -> List[str]:
        """Get tools and technologies to learn based on analysis."""
        resume_skill_names = [skill.skill.lower().strip() for skill in resume_skills]

        recommended_tools = []

        # Tools for missing critical skills
        critical_missing_tools = [
            'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
            'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
            'Machine Learning', 'Deep Learning', 'Prompt Engineering',
            'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy'
        ]

        for tool in critical_missing_tools:
            if tool.lower() not in resume_skill_names:
                recommended_tools.append(tool)

        # Add AI PM specific tools
        recommended_tools.extend([
            'Product Analytics', 'A/B Testing Tools', 'User Research Platforms',
            'Feature Management Systems', 'API Documentation Tools',
            'CI/CD Pipelines', 'Monitoring & Observability Tools',
            'Business Intelligence', 'Data Visualization'
        ])

        return recommended_tools[:15]

    def generate_suggested_skills(self, job_required_skills: List[AIMPSkill],
                                 resume_skills: List[AIMPSkill],
                                 scoring_results: Dict[str, Any]) -> List[AIMPSkill]:
        """Generate suggested skills for improvement."""
        resume_skill_names = set([skill.skill.lower().strip() for skill in resume_skills])

        suggested_skills = []

        # Add missing critical skills
        for skill in job_required_skills:
            if skill.skill.lower().strip() not in resume_skill_names:
                suggested_skills.append(AIMPSkill(
                    category=skill.category,
                    skill=skill.skill,
                    importance='High' if skill.importance == 'Critical' else 'Medium',
                    relevance_score=0.8,
                    acquisition_difficulty='Medium'
                ))

        return suggested_skills[:10]

    def parse_resume_file(self, file_path: str, file_type: str) -> str:
        """Parse resume file based on file type."""
        if file_type.lower() == 'pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_type.lower() in ['doc', 'docx']:
            return self.extract_text_from_docx(file_path)
        elif file_type.lower() == 'txt':
            return self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")