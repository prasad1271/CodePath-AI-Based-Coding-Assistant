from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class ProblemTestCaseSummary(BaseModel):
    id: str
    input: str
    expected_output: str
    is_hidden: bool = False
    order_index: int = 0

    class Config:
        from_attributes = True


class ProblemSummary(BaseModel):
    id: str
    slug: str
    title: str
    difficulty: str
    topic: str
    acceptance_rate: float
    is_solved: bool = False
    company_tags: List[str] = []

    class Config:
        from_attributes = True


class ProblemDetail(ProblemSummary):
    description: str
    languages_supported: List[str]
    starter_codes: Dict[str, str]
    constraints_text: Optional[str] = None
    hints: List[str] = []
    solution_explanation: Optional[str] = None
    test_cases: List[ProblemTestCaseSummary] = []


class CodeRunRequest(BaseModel):
    language: str
    code: str
    custom_input: Optional[str] = None


class CodeRunResponse(BaseModel):
    status: str  # Success, Runtime Error, Time Limit Exceeded, Compilation Error
    output: str
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    memory_used_kb: float = 0.0


class SubmissionCreate(BaseModel):
    problem_id: str
    language: str
    code: str


class SubmissionResponse(BaseModel):
    id: str
    problem_id: str
    language: str
    status: str
    execution_time_ms: float
    memory_used_kb: float
    passed_test_cases: int
    total_test_cases: int
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
