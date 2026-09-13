from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, Text
from app.core.database import Base
from app.models.user import generate_uuid


class DsaTopic(Base):
    __tablename__ = "dsa_topics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    order_index = Column(Integer, default=0)
    concept_explanation = Column(Text, nullable=False)
    patterns = Column(JSON, default=list)
    visualization_type = Column(String(50), default="array")
    common_mistakes = Column(JSON, default=list)
    problem_slugs = Column(JSON, default=list)
    interview_questions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
