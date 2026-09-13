from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Numeric, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mode = Column(String(50), nullable=False)  # HR, Technical, Coding, DSA, Project, Behavioral
    target_role = Column(String(100), nullable=False)
    status = Column(String(50), default="in_progress")  # in_progress, completed
    overall_score = Column(Numeric(5, 2), nullable=True)
    technical_score = Column(Numeric(5, 2), nullable=True)
    problem_solving_score = Column(Numeric(5, 2), nullable=True)
    communication_score = Column(Numeric(5, 2), nullable=True)
    confidence_score = Column(Numeric(5, 2), nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interviews")
    questions = relationship("InterviewQuestion", back_populates="interview", cascade="all, delete-orphan", order_by="InterviewQuestion.question_order")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_id = Column(String(36), ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    expected_aspects = Column(JSON, default=list)
    question_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    interview_question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False)
    user_answer_text = Column(Text, nullable=False)
    score = Column(Numeric(5, 2), nullable=True)
    feedback = Column(Text, nullable=True)
    suggested_answer = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("InterviewQuestion", back_populates="answers")
