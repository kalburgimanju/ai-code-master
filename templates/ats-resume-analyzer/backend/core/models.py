"""
Data models for ATS Resume Analyzer.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Any, Optional
from enum import Enum
@dataclass
class FileUpload:
    filename: str
    content_type: str
    file_path: str
    file_size: int
    uploaded_at: datetime = field(default_factory=datetime.now)
@dataclass
class AnalysisRequest:
    resume_file: FileUpload
    job_description: str
    position_level: str = "auto"
    industry: str = "technology"
    experience_level: str = "auto"
    analysis_depth: str = "comprehensive"  # comprehensive, standard, quick
    custom_keywords: Optional[List[str]] = None
    exclude_keywords: Optional[List[str]] = None
@dataclass
class FileUploadResponse:
    success: bool
    message: str
    file_id: Optional[str] = None
    file_path: Optional[str] = None
    extracted_text: Optional[str] = None
    processing_time: Optional[float] = None
@dataclass
class AnalysisResponse:
    success: bool
    message: str
    ats_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    extracted_skills: Optional[List[str]] = None
    extracted_experience: Optional[List[str]] = None
    extracted_education: Optional[List[str]] = None
    missing_keywords: Optional[List[str]] = None
    suggested_skills: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    strongest_matches: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    analysis_date: Optional[datetime] = None
    processing_time: Optional[float] = None
class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
@dataclass
class AnalysisJob:
    job_id: str
    status: ProcessingStatus = ProcessingStatus.PENDING
    request: AnalysisRequest
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    result: Optional[AnalysisResponse] = None
    error_message: Optional[str] = None
    retry_count: int = 0
@dataclass
class UserProfile:
    user_id: str
    email: str
    subscription_plan: str = "free"  # free, pro, enterprise
    analysis_count: int = 0
    max_analyses_per_month: int = 10
    created_at: datetime = field(default_factory=datetime.now)
    last_analysis_at: Optional[datetime] = None
@dataclass
class APIKey:
    key_id: str
    key_hash: str
    user_id: str
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    last_used_at: Optional[datetime] = None
@dataclass
class AuditLog:
    log_id: str
    user_id: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.now)
    details: Optional[Dict[str, Any]] = None