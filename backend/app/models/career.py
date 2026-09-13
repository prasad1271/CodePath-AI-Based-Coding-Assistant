from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Text
from app.core.database import Base
from app.models.user import generate_uuid


class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    target_role = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    salary_range = Column(String(100), nullable=True)
    market_demand = Column(String(50), default="High")
    required_languages = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    dsa_requirements = Column(JSON, default=list)
    projects_required = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    interview_topics = Column(JSON, default=list)
    resume_skills = Column(JSON, default=list)
    github_expectations = Column(JSON, default=list)
    learning_sequence = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
