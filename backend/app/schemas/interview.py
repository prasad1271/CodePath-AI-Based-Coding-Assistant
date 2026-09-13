from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class InterviewStartRequest(BaseModel):
    mode: str = "Technical"  # HR, Technical, Coding, DSA, Project, Behavioral
    target_role: str = "Software Developer"


class InterviewAnswerSubmit(BaseModel):
    answer_text: str


class InterviewQuestionResponse(BaseModel):
    id: str
    question_text: str
    question_order: int
    user_answer: Optional[str] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    suggested_answer: Optional[str] = None

    class Config:
        from_attributes = True


class InterviewSessionResponse(BaseModel):
    id: str
    mode: str
    target_role: str
    status: str
    current_question: Optional[InterviewQuestionResponse] = None
    overall_score: Optional[float] = None
    technical_score: Optional[float] = None
    problem_solving_score: Optional[float] = None
    communication_score: Optional[float] = None
    confidence_score: Optional[float] = None
    strengths: List[str] = []
    weaknesses: List[str] = []
    feedback_text: Optional[str] = None
    questions: List[InterviewQuestionResponse] = []
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
