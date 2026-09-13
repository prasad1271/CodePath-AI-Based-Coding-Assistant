from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    icon = Column(String(100), nullable=False)
    difficulty = Column(String(50), nullable=False)
    order_index = Column(Integer, default=0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_index")


class Module(Base):
    __tablename__ = "modules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    module_id = Column(String(36), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    solution_code = Column(Text, nullable=True)
    hints = Column(JSON, default=list)
    quiz_questions = Column(JSON, default=list)
    practice_problem_slug = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="lessons")


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    current_week = Column(Integer, default=1)
    total_weeks = Column(Integer, default=8)
    status = Column(String(50), default="active")
    roadmap_data = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Progress(Base):
    __tablename__ = "progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)  # lesson, problem, dsa_topic, project
    entity_id = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="in_progress")
    score = Column(Numeric(5, 2), default=100.00)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
