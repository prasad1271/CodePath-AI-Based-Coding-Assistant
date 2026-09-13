from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Numeric, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class PlacementTest(Base):
    __tablename__ = "placement_tests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # Aptitude, Logical Reasoning, Verbal, CS Fundamentals
    time_limit_minutes = Column(Integer, default=30)
    total_questions = Column(Integer, default=15)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("PlacementQuestion", back_populates="test", cascade="all, delete-orphan")


class PlacementQuestion(Base):
    __tablename__ = "placement_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    test_id = Column(String(36), ForeignKey("placement_tests.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(100), nullable=False)  # DBMS, OS, Computer Networks, OOP, SQL, etc.
    question_text = Column(Text, nullable=False)
    options = Column(JSON, default=list)
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)

    test = relationship("PlacementTest", back_populates="questions")


class PlacementAttempt(Base):
    __tablename__ = "placement_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_id = Column(String(36), ForeignKey("placement_tests.id", ondelete="CASCADE"), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    total_score = Column(Numeric(5, 2), nullable=False)
    percentage = Column(Numeric(5, 2), nullable=False)
    answers = Column(JSON, default=dict)
    completed_at = Column(DateTime, default=datetime.utcnow)
