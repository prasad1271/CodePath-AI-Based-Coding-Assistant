from typing import List
from pydantic import BaseModel


class DsaTopicSummary(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    order_index: int
    visualization_type: str
    is_completed: bool = False

    class Config:
        from_attributes = True


class DsaTopicDetail(DsaTopicSummary):
    concept_explanation: str
    patterns: List[str] = []
    common_mistakes: List[str] = []
    problem_slugs: List[str] = []
    interview_questions: List[str] = []
