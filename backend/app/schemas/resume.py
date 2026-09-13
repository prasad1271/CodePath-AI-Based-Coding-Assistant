from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ResumeBase(BaseModel):
    title: str = "My Tech Resume"
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[dict] = []
    projects: List[dict] = []
    experience: List[dict] = []
    certifications: List[dict] = []


class ResumeCreate(ResumeBase):
    pass


class ResumeResponse(ResumeBase):
    id: str
    user_id: str
    ats_score: float
    ats_feedback: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AtsAnalysisResponse(BaseModel):
    ats_score: float
    keyword_matches: List[str] = []
    missing_critical_skills: List[str] = []
    action_verb_score: float
    quantifiable_metrics_present: bool
    section_scores: dict
    recommendations: List[str] = []


class BulletImproveRequest(BaseModel):
    original_bullet: str
    role_or_project_context: Optional[str] = None


class BulletImproveResponse(BaseModel):
    original_bullet: str
    improved_bullets: List[str]
    rationale: str
