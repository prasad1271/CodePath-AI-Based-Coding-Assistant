from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="My Tech Resume")
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    github_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    summary = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    ats_score = Column(Numeric(5, 2), default=0)
    ats_feedback = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class GithubProfile(Base):
    __tablename__ = "github_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    github_username = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    checklist_results = Column(JSON, default=list)
    audit_score = Column(Numeric(5, 2), default=0)
    recommendations = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
