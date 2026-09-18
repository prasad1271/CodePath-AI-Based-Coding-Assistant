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
    error_type: str = "Syntax or Runtime Error"
    what_happened: str = "An error occurred during code analysis or execution."
    why_it_happened: str = "Language constraints or runtime rules were violated."
    where_it_happened: str = "Unknown location"
    how_to_fix: str = "Inspect the indicated line and rectify syntax, types, or control logic."
    corrected_example: str = ""
    prevention_tip: str = "Use static type analysis, defensive boundary checks, and automated linters."
    practice_question: str = "How can you prevent similar errors when structuring this logic?"
    rectified_code: Optional[str] = None
    line_number: Optional[int] = None
    severity: Optional[str] = "error"


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


class AiCodeReviewRequest(BaseModel):
    problem_title: str
    problem_description: Optional[str] = ""
    code: str
    language: str = "python"


class AiCodeReviewResponse(BaseModel):
    time_complexity: str
    space_complexity: str
    time_analysis: str
    space_analysis: str
    strengths: List[str] = []
    edge_cases: List[str] = []
    clean_code_tips: List[str] = []
    optimization_suggestion: str


class AiLessonExplainRequest(BaseModel):
    lesson_title: str
    lesson_content: str
    student_question: str
    language: Optional[str] = "python"


class AiLessonExplainResponse(BaseModel):
    explanation: str
    key_takeaways: List[str] = []
    sample_code: Optional[str] = None
    challenge_question: Optional[str] = None


class AiCareerAssessmentRequest(BaseModel):
    target_role: str = "Full Stack Engineer"
    skills: List[str] = []
    solved_problems_count: int = 0
    projects: List[dict] = []


class AiCareerAssessmentResponse(BaseModel):
    readiness_score: float
    target_role: str
    top_strengths: List[str] = []
    critical_skill_gaps: List[str] = []
    recommended_projects: List[dict] = []
    weekly_action_plan: List[str] = []
