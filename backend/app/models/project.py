from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Web, Mobile, AI/ML, etc.
    difficulty = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    description = Column(Text, nullable=False)
    architecture_overview = Column(Text, nullable=True)
    tech_stack = Column(JSON, default=list)
    database_design = Column(Text, nullable=True)
    api_design = Column(Text, nullable=True)
    folder_structure = Column(Text, nullable=True)
    readme_content = Column(Text, nullable=True)
    resume_bullets = Column(JSON, default=list)
    github_repo_url = Column(String(500), nullable=True)
    live_demo_url = Column(String(500), nullable=True)
    status = Column(String(50), default="in_progress")  # planned, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    tasks = relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan", order_by="ProjectTask.order_index")


class ProjectTask(Base):
    __tablename__ = "project_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    milestone = Column(String(100), nullable=False)
    is_completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
