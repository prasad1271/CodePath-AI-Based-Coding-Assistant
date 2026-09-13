from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ProjectTaskBase(BaseModel):
    title: str
    milestone: str
    is_completed: bool = False
    order_index: int = 0


class ProjectTaskResponse(ProjectTaskBase):
    id: str
    project_id: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProjectCreate(BaseModel):
    title: str
    category: str  # Web, Mobile, AI/ML, Data Science, Cybersecurity, Cloud
    difficulty: str  # Beginner, Intermediate, Advanced
    description: str
    architecture_overview: Optional[str] = None
    tech_stack: List[str] = []
    database_design: Optional[str] = None
    api_design: Optional[str] = None
    folder_structure: Optional[str] = None
    readme_content: Optional[str] = None
    resume_bullets: List[str] = []
    github_repo_url: Optional[str] = None
    live_demo_url: Optional[str] = None


class ProjectResponse(ProjectCreate):
    id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    tasks: List[ProjectTaskResponse] = []

    class Config:
        from_attributes = True


class ProjectGenerateRequest(BaseModel):
    category: str
    difficulty: str
    interest_area: Optional[str] = None
    preferred_tech: Optional[str] = None
