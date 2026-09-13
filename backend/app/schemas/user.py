from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student"
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProfileBase(BaseModel):
    branch: Optional[str] = "Computer Science & Engineering"
    academic_year: Optional[str] = "3rd Year"
    programming_experience: Optional[str] = "Beginner"
    preferred_language: Optional[str] = "python"
    current_skill_level: Optional[str] = "Beginner"
    career_goal: Optional[str] = "Full Stack Developer"
    daily_available_time: Optional[str] = "2 hours"
    dsa_experience: Optional[str] = "Beginner"
    project_experience: Optional[str] = "None"
    placement_goal: Optional[str] = "Product-Based Company"
    college: Optional[str] = "Engineering Institute of Technology"
    degree: Optional[str] = "B.Tech Computer Science"
    graduation_year: Optional[int] = 2026
    bio: Optional[str] = "Aspiring software engineer learning algorithms, full-stack development, and system design."
    skills: Optional[List[str]] = ["Python", "Data Structures", "Next.js", "SQL"]
    github_url: Optional[str] = "https://github.com"
    linkedin_url: Optional[str] = "https://linkedin.com"
    portfolio_url: Optional[str] = None
    phone: Optional[str] = None


class ProfileUpdateInput(BaseModel):
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    programming_experience: Optional[str] = None
    preferred_language: Optional[str] = None
    current_skill_level: Optional[str] = None
    career_goal: Optional[str] = None
    daily_available_time: Optional[str] = None
    dsa_experience: Optional[str] = None
    project_experience: Optional[str] = None
    placement_goal: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None


class OnboardingInput(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    career_readiness_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_activity_date: Optional[date] = None

    class Config:
        from_attributes = True


class UserDashboardResponse(BaseModel):
    user: UserResponse
    profile: ProfileResponse
    streak: StreakResponse
    stats: dict
    recommended_lessons: List[dict]
    recommended_problems: List[dict]
    career_readiness_breakdown: dict
