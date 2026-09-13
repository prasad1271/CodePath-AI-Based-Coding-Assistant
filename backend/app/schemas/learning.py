from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class CourseBase(BaseModel):
    slug: str
    title: str
    description: str
    language: str
    icon: str
    difficulty: str
    order_index: int = 0
    is_published: bool = True


class CourseResponse(CourseBase):
    id: str
    created_at: datetime
    modules_count: Optional[int] = 0
    lessons_count: Optional[int] = 0
    completed_lessons: Optional[int] = 0

    class Config:
        from_attributes = True


class LessonSummary(BaseModel):
    id: str
    slug: str
    title: str
    order_index: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class ModuleResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str] = None
    order_index: int
    lessons: List[LessonSummary] = []

    class Config:
        from_attributes = True


class LessonDetailResponse(BaseModel):
    id: str
    module_id: str
    slug: str
    title: str
    content_markdown: str
    code_snippet: Optional[str] = None
    solution_code: Optional[str] = None
    hints: List[str] = []
    quiz_questions: List[dict] = []
    practice_problem_slug: Optional[str] = None
    order_index: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    entity_type: str  # lesson, problem, dsa_topic, project
    entity_id: str
    status: str  # in_progress, completed
    score: Optional[float] = 100.00
