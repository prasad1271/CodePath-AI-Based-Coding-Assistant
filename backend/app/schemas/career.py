from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class CareerPathSummary(BaseModel):
    id: str
    slug: str
    title: str
    target_role: str
    description: str
    salary_range: Optional[str] = None
    market_demand: str

    class Config:
        from_attributes = True


class CareerPathDetail(CareerPathSummary):
    required_languages: List[str] = []
    technologies: List[str] = []
    dsa_requirements: List[str] = []
    projects_required: List[str] = []
    certifications: List[str] = []
    interview_topics: List[str] = []
    resume_skills: List[str] = []
    github_expectations: List[str] = []
    learning_sequence: List[str] = []


class CareerReadinessScore(BaseModel):
    overall_score: float
    programming_score: float
    dsa_score: float
    projects_score: float
    interview_score: float
    resume_score: float
    readiness_level: str  # Beginner, Developing, Placement Ready, Advanced
    strengths: List[str] = []
    growth_areas: List[str] = []
