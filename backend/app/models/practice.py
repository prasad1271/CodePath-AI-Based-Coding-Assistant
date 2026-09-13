from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Problem(Base):
    __tablename__ = "problems"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(50), nullable=False, index=True)  # Easy, Medium, Hard
    topic = Column(String(100), nullable=False, index=True)
    languages_supported = Column(JSON, default=["python", "javascript", "java", "cpp", "c"])
    starter_codes = Column(JSON, default=dict)
    constraints_text = Column(Text, nullable=True)
    hints = Column(JSON, default=list)
    solution_explanation = Column(Text, nullable=True)
    company_tags = Column(JSON, default=list)
    acceptance_rate = Column(Numeric(5, 2), default=75.00)
    created_at = Column(DateTime, default=datetime.utcnow)

    test_cases = relationship("ProblemTestCase", back_populates="problem", cascade="all, delete-orphan", order_by="ProblemTestCase.order_index")
    submissions = relationship("Submission", back_populates="problem", cascade="all, delete-orphan")


class ProblemTestCase(Base):
    __tablename__ = "problem_test_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    input = Column(Text, nullable=False)
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    problem = relationship("Problem", back_populates="test_cases")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id = Column(String(36), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="Pending")  # Accepted, Wrong Answer, etc.
    execution_time_ms = Column(Numeric(8, 2), default=0)
    memory_used_kb = Column(Numeric(10, 2), default=0)
    passed_test_cases = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")
