"""
Core analysis logic for ATS Resume Analyzer.
Handles resume parsing, job description analysis, and scoring algorithms.
"""

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import defaultdict

# Graceful fallback for sentence-transformers
try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  sentence-transformers not available: {e}")
    print("Creating a mock embedder for testing...")
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    embedder = _create_mock_embedder()
else:
    try:
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
        print("✓ sentence-transformers loaded successfully")
    except Exception as e:
        print(f"⚠️  Failed to load sentence-transformers model: {e}")
        print("Using mock embedder...")
        embedder = _create_mock_embedder()

# Now import other dependencies
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    print("⚠️  spacy not available - some features will be limited")
    SPACY_AVAILABLE = False

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    print("⚠️  scikit-learn not available - some features will be limited")
    SKLEARN_AVAILABLE = False

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

def _create_mock_embedder():
    """Create a mock embedder for development when dependencies are missing."""
    class MockEmbedder:
        def encode(self, texts):
            import numpy as np
            return np.random.rand(len(texts), 384).astype(np.float32)

        def __call__(self, text):
            return self.encode([text])

    return MockEmbedder()

try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Install if not available
    import subprocess
    subprocess.run(["python", "-m", "pip", "install", "spacy"])
    subprocess.run(["python", "-c", "import spacy; spacy.cli.download('en_core_web_sm')"])
    nlp = spacy.load("en_core_web_sm")

# Load sentence transformer model
# Import sentence transformer with graceful fallback
import importlib.util
import sys

# Try to import the module directly
try:
    embedder = SentenceTransformer('all-MiniLM-L6-v2')
except ImportError as e:
    print(f"Warning: sentence-transformers not available: {e}")
    print("Creating a mock embedder for testing...")
    # Create a simple mock for testing when sentence-transformers is not available
    class MockEmbedder:
        def encode(self, texts):
            # Return mock embeddings with the same shape as all-MiniLM-L6-v2
            import numpy as np
            return np.random.rand(len(texts), 384).astype(np.float32)

        def __call__(self, text):
            return self.encode([text])

    embedder = MockEmbedder()
@dataclass
class ScoreBreakdown:
    """Detailed breakdown of scoring components."""
    keyword_match: float = 0.0
    skills_alignment: float = 0.0
    experience_match: float = 0.0
    education_match: float = 0.0
    grammar_score: float = 0.0
    completeness_score: float = 0.0

@dataclass
class ResumeAnalysis:
    """Complete analysis result."""
    ats_score: float
    score_breakdown: ScoreBreakdown
    extracted_skills: List[str] = field(default_factory=list)
    extracted_experience: List[str] = field(default_factory=list)
    extracted_education: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    suggested_skills: List[str] = field(default_factory=list)
    improvements: List[str] = field(default_factory=list)
    strongest_matches: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    analysis_date: datetime = field(default_factory=datetime.now)
class ATSResumeAnalyzer:
    """
    Main analyzer class for ATS resume evaluation.
    """

    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.scoring_weights = {
            'keywords': 0.3,
            'skills': 0.25,
            'experience': 0.25,
            'education': 0.1,
            'grammar': 0.05,
            'completeness': 0.05
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file."""
        try:
            import PyPDF2
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ''
                for page in reader.pages:
                    text += page.extract_text() + '\n'
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
        """Preprocess text for analysis."""
        # Clean up text
        text = re.sub(r'\s+', ' ', text)  # Remove extra whitespace
        text = text.strip()  # Strip leading/trailing whitespace

        # Extract and clean keywords/phrases
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)  # Remove URLs
        text = re.sub(r'\@\w+|\#\w+', '', text)  # Remove mentions and hashtags

        return text

    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from text using NLP and pattern matching."""
        skills = []

        # Common technical skills patterns
        skill_patterns = [
            r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|Go|Ruby|PHP)\b',
            r'\b(?:React|Angular|Vue|Node\.js|Express|Django|Flask)\b',
            r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Git)\b',
            r'\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis)\b',
            r'\b(?:Machine Learning|Deep Learning|AI|NLP|Computer Vision)\b',
            r'\b(?:Agile|Scrum|Jenkins|CI/CD|DevOps)\b',
            r'\b(?:HTML|CSS|SASS|LESS|Bootstrap|Tailwind)\b',
            r'\b(?:Docker|Kubernetes|EKS|AKS|GKE)\b',
        ]

        # Extract skills using patterns
        for pattern in skill_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            skills.extend([match.capitalize() for match in matches])

        # Use spaCy for named entity recognition
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ in ['PRODUCT', 'LANGUAGE', 'SKILL', 'WORK_TOOL']:
                skills.append(ent.text)

        # Remove duplicates and normalize
        skills = list(set([skill.strip() for skill in skills]))
        skills = [skill for skill in skills if len(skill) > 2 and skill.lower() not in self.stop_words]

        return skills

    def extract_experience_from_text(self, text: str) -> List[str]:
        """Extract work experience descriptions."""
        experience_patterns = [
            r'\b(?:\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'\b(?:worked|worked with|employed)\s+(?:as|with)\s+[A-Z][a-z]+',
            r'\b(?:senior|junior|mid-level|lead|principal)\s+(?:developer|engineer|manager|analyst)',
        ]

        experiences = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            experiences.extend(matches)

        # Also extract sentences containing work-related keywords
        work_keywords = ['company', 'industry', 'position', 'role', 'worked', 'employed']
        sentences = nltk.sent_tokenize(text)
        for sentence in sentences:
            if any(keyword in sentence.lower() for keyword in work_keywords):
                experiences.append(sentence.strip())

        return list(set(experiences))[:10]  # Limit to top 10 unique experiences

    def extract_education_from_text(self, text: str) -> List[str]:
        """Extract education information."""
        education_patterns = [
            r'\b(?:B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|MBA)\b',
            r'\b(?:Bachelor|Master|Doctor|Associate)\s+(?:of\s+)?[A-Z][a-z\s]+\b',
            r'[A-Z][a-z]+\s+(?:University|College|Institute|School)',
        ]

        education = []
        for pattern in education_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            education.extend(matches)

        return list(set(education))[:10]

    def generate_semantic_embeddings(self, texts: List[str]) -> Any:
        """Generate semantic embeddings for texts."""
        embeddings = embedder.encode(texts)
        return embeddings

    def calculate_keyword_similarity(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Calculate keyword and semantic similarity between resume and job description."""
        # TF-IDF vectorization
        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            lowercase=True
        )

        # Create documents
        docs = [resume_text, job_description]
        tfidf_matrix = vectorizer.fit_transform(docs)

        # Calculate cosine similarity
        similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        semantic_similarity = similarity_matrix[0][0]

        # Extract keywords from each document
        resume_words = set(vectorizer.get_feature_names_out())[
            tfidf_matrix[0].nonzero()[0]
        ]
        jd_words = set(vectorizer.get_feature_names_out())[
            tfidf_matrix[1].nonzero()[0]
        ]

        # Calculate keyword match
        common_keywords = resume_words.intersection(jd_words)
        keyword_match_score = len(common_keywords) / len(jd_words) if jd_words else 0.0

        return {
            'semantic_similarity': semantic_similarity,
            'keyword_match_score': keyword_match_score,
            'common_keywords': list(common_keywords),
            'missing_keywords': list(jd_words - resume_words),
            'resume_keywords': list(resume_words),
            'jd_keywords': list(jd_words),
        }

    def calculate_skills_alignment(self, resume_skills: List[str], jd_required_skills: List[str]) -> Dict[str, Any]:
        """Calculate skills alignment between resume and job description."""
        resume_skills_set = set([skill.lower().strip() for skill in resume_skills])
        jd_skills_set = set([skill.lower().strip() for skill in jd_required_skills])

        # Calculate overlap
        matched_skills = resume_skills_set.intersection(jd_skills_set)
        missing_skills = jd_skills_set - resume_skills_set

        # Calculate alignment score
        skills_alignment_score = len(matched_skills) / len(jd_skills_set) if jd_skills_set else 0.0

        return {
            'alignment_score': skills_alignment_score,
            'matched_skills': list(matched_skills),
            'missing_skills': list(missing_skills),
            'resume_skills_count': len(resume_skills_set),
            'jd_skills_count': len(jd_skills_set),
        }

    def calculate_experience_match(self, resume_experience: List[str], jd_requirements: List[str]) -> Dict[str, Any]:
        """Calculate experience match based on relevance."""
        if not resume_experience or not jd_requirements:
            return {'alignment_score': 0.0, 'matched_experience': [], 'missing_experience': jd_requirements}

        # Convert to embeddings for semantic similarity
        resume_exp_text = ' '.join(resume_experience)
        jd_req_text = ' '.join(jd_requirements)

        # Use simple keyword matching for experience
        exp_keywords = ['years', 'experience', 'worked', 'senior', 'junior', 'lead']
        matches = []
        for exp in resume_experience:
            exp_lower = exp.lower()
            if any(keyword in exp_lower for keyword in exp_keywords):
                matches.append(exp)

        experience_score = len(matches) / len(jd_requirements) if jd_requirements else 0.0

        return {
            'alignment_score': experience_score,
            'matched_experience': matches,
            'missing_experience': [req for req in jd_requirements if req not in matches],
        }

    def analyze_text_quality(self, text: str) -> Dict[str, float]:
        """Analyze text quality (grammar, completeness, readability)."""
        scores = {}

        # Grammar score (basic sentence analysis)
        sentences = nltk.sent_tokenize(text)
        if sentences:
            grammar_issues = 0
            for sentence in sentences:
                # Simple grammar checks
                if sentence.endswith((' ', '\t', '\n')):
                    grammar_issues += 1
                if '  ' in sentence:  # Double spaces
                    grammar_issues += 0.5
                if sentence.count('.') > len(sentence.split()) * 0.3:  # Too many periods
                    grammar_issues += 0.5

            grammar_score = max(0, 1.0 - (grammar_issues / len(sentences))) * 100
            scores['grammar_score'] = grammar_score
        else:
            scores['grammar_score'] = 0.0

        # Completeness score (presence of key sections)
        completeness_score = 0.0
        key_sections = ['experience', 'education', 'skills', 'summary', 'objective', 'work history']
        for section in key_sections:
            if section.lower() in text.lower():
                completeness_score += 25.0

        scores['completeness_score'] = completeness_score

        return scores

    def generate_improvements(self, analysis: ResumeAnalysis) -> List[str]:
        """Generate improvement suggestions based on analysis."""
        improvements = []

        # Missing keywords improvements
        if analysis.missing_keywords:
            top_missing = analysis.missing_keywords[:5]
            improvements.extend([
                f"Add missing keywords: {', '.join(top_missing)}",
                "Incorporate industry-specific terminology",
                "Include relevant technical skills"
            ])

        # Skills improvements
        if analysis.suggested_skills:
            improvements.append(f"Consider adding these skills: {', '.join(analysis.suggested_skills[:5])}")

        # Experience improvements
        if len(analysis.extracted_experience) < 3:
            improvements.append("Provide more detailed work experience descriptions")

        # Education improvements
        if not analysis.extracted_education:
            improvements.append("Add educational qualifications and certifications")

        # General improvements
        improvements.extend([
            "Improve resume formatting for better ATS readability",
            "Use action verbs to describe achievements",
            "Include quantifiable achievements and metrics",
            "Ensure consistent formatting and professional tone"
        ])

        # Remove duplicates
        improvements = list(set(improvements))
        return improvements[:10]  # Limit to top 10 suggestions

    def analyze_resume(self, resume_text: str, job_description: str) -> ResumeAnalysis:
        """
        Main analysis method that processes resume and job description.
        """
        # Preprocess texts
        resume_text = self.preprocess_text(resume_text)
        job_description = self.preprocess_text(job_description)

        # Extract information from resume
        resume_skills = self.extract_skills_from_text(resume_text)
        resume_experience = self.extract_experience_from_text(resume_text)
        resume_education = self.extract_education_from_text(resume_text)

        # Extract key requirements from job description
        jd_required_skills = self.extract_skills_from_text(job_description)
        jd_requirements = self.extract_experience_from_text(job_description)

        # Calculate component scores
        keyword_results = self.calculate_keyword_similarity(resume_text, job_description)
        skills_results = self.calculate_skills_alignment(resume_skills, jd_required_skills)
        experience_results = self.calculate_experience_match(resume_experience, jd_requirements)

        # Analyze text quality
        quality_scores = self.analyze_text_quality(resume_text)

        # Calculate individual scores
        scores = ScoreBreakdown(
            keyword_match=keyword_results['keyword_match_score'] * 100,
            skills_alignment=skills_results['alignment_score'] * 100,
            experience_match=experience_results['alignment_score'] * 100,
            education_match=50.0,  # Placeholder - could be improved
            grammar_score=quality_scores['grammar_score'],
            completeness_score=quality_scores['completeness_score']
        )

        # Calculate weighted final score
        ats_score = (
            scores.keyword_match * self.scoring_weights['keywords'] +
            scores.skills_alignment * self.scoring_weights['skills'] +
            scores.experience_match * self.scoring_weights['experience'] +
            scores.education_match * self.scoring_weights['education'] +
            scores.grammar_score * self.scoring_weights['grammar'] +
            scores.completeness_score * self.scoring_weights['completeness']
        )

        # Generate recommendations and insights
        missing_keywords = keyword_results['missing_keywords'][:15]
        suggested_skills = list(set(jd_required_skills) - set(resume_skills))[:10]
        strongest_matches = keyword_results['common_keywords'][:10]

        # Generate improvement suggestions
        improvements = self.generate_improvements(ResumeAnalysis(ats_score, scores))

        # Identify strengths and weaknesses
        strengths = []
        if scores.skills_alignment > 70:
            strengths.append("Strong skills alignment with job requirements")
        if scores.experience_match > 80:
            strengths.append("Relevant work experience")
        if keyword_results['keyword_match_score'] > 0.5:
            strengths.append("Good keyword optimization")

        weaknesses = []
        if scores.skills_alignment < 50:
            weaknesses.append("Skills gap with job requirements")
        if scores.experience_match < 60:
            weaknesses.append("Limited relevant experience")
        if not resume_education:
            weaknesses.append("Missing educational qualifications")

        # Create final analysis
        analysis = ResumeAnalysis(
            ats_score=ats_score,
            score_breakdown=scores,
            extracted_skills=resume_skills,
            extracted_experience=resume_experience,
            extracted_education=resume_education,
            missing_keywords=missing_keywords,
            suggested_skills=suggested_skills,
            improvements=improvements,
            strongest_matches=strongest_matches,
            strengths=strengths,
            weaknesses=weaknesses
        )

        return analysis

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