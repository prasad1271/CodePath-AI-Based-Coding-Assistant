from typing import Optional, List
from pydantic import BaseModel, Field


class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    mode: str = "explain"  # explain, debug, improve, hint, example, practice, interview, project
    language: Optional[str] = "python"
    code_context: Optional[str] = Field(default=None, max_length=50000)
    conversation_id: Optional[str] = None


class AiChatResponse(BaseModel):
    conversation_id: str
    response: str
    mode: str
    suggested_hints: List[str] = []
    follow_up_questions: List[str] = []


class ErrorDoctorRequest(BaseModel):
    language: str
    code: str
    error_message: Optional[str] = None


class ErrorDoctorResponse(BaseModel):
    error_type: str
    what_happened: str
    why_it_happened: str
    where_it_happened: str
    how_to_fix: str
    corrected_example: str
    prevention_tip: str
    practice_question: str


class AiHintRequest(BaseModel):
    problem_title: str
    student_code: str
    current_error_or_issue: Optional[str] = None
    hints_already_given: int = 0


class AiHintResponse(BaseModel):
    hint_level: int
    hint: str
    guiding_question: str
    concept_to_review: str
