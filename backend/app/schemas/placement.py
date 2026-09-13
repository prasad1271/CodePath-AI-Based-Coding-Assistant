from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel


class PlacementQuestionSummary(BaseModel):
    id: str
    subject: str
    question_text: str
    options: List[str]

    class Config:
        from_attributes = True


class PlacementTestSummary(BaseModel):
    id: str
    title: str
    category: str
    time_limit_minutes: int
    total_questions: int

    class Config:
        from_attributes = True


class PlacementTestDetail(PlacementTestSummary):
    questions: List[PlacementQuestionSummary] = []


class PlacementSubmitRequest(BaseModel):
    test_id: str
    answers: Dict[str, int]  # question_id -> chosen_option_index


class PlacementResultResponse(BaseModel):
    attempt_id: str
    score: float
    total_score: float
    percentage: float
    subject_breakdown: Dict[str, Dict[str, float]]
    explanations: List[dict]
