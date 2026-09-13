from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class AdminUserCreate(BaseModel):
    email: str
    full_name: str
    role: str = "student"


class AdminUserUpdate(BaseModel):
    role: Optional[str] = None
    full_name: Optional[str] = None


class AdminStatsResponse(BaseModel):
    total_users: int
    total_problems: int
    total_submissions: int
    total_projects: int
    total_interviews: int
    submissions_today: int
    active_streaks: int
    system_status: str
