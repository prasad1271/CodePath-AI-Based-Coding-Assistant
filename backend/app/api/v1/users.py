from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Profile, UserSettings, Streak
from app.models.learning import Progress, Course, Lesson
from app.models.practice import Submission, Problem
from app.schemas.user import UserResponse, ProfileResponse, OnboardingInput, ProfileUpdateInput, UserDashboardResponse, StreakResponse
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=ApiResponse[ProfileResponse])
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return ApiResponse(success=True, data=ProfileResponse.from_orm(profile))


@router.put("/profile", response_model=ApiResponse[ProfileResponse])
def update_profile(
    payload: ProfileUpdateInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    update_data = payload.dict(exclude_unset=True)
    if "full_name" in update_data and update_data["full_name"]:
        current_user.full_name = update_data.pop("full_name")

    for field, val in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data=ProfileResponse.from_orm(profile))


@router.post("/onboarding", response_model=ApiResponse[ProfileResponse])
def complete_onboarding(
    payload: OnboardingInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    for field, val in payload.dict(exclude_unset=True).items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)

    # Recalculate readiness
    CareerReadinessService.calculate_user_readiness(db, current_user.id)

    return ApiResponse(success=True, data=ProfileResponse.from_orm(profile))


@router.get("/dashboard", response_model=ApiResponse[UserDashboardResponse])
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    streak = db.query(Streak).filter(Streak.user_id == current_user.id).first()
    if not streak:
        streak = Streak(user_id=current_user.id, current_streak=1, longest_streak=1)
        db.add(streak)
        db.commit()
        db.refresh(streak)

    # Calculate real stats
    problems_solved = db.query(Submission.problem_id).filter(
        Submission.user_id == current_user.id,
        Submission.status == "Accepted"
    ).distinct().count()

    lessons_completed = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "lesson",
        Progress.status == "completed"
    ).count()

    dsa_completed = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "dsa_topic",
        Progress.status == "completed"
    ).count()

    readiness = CareerReadinessService.calculate_user_readiness(db, current_user.id)

    # Recommendations
    recommended_lessons = [
        {"id": "l1", "title": "Variables & Standard Output", "course": "Python for Engineers", "slug": "variables-and-print", "course_slug": "python-fundamentals"},
        {"id": "l2", "title": "Data Types & Type Conversion", "course": "Python for Engineers", "slug": "data-types-and-casting", "course_slug": "python-fundamentals"}
    ]

    recommended_problems = [
        {"id": "p1", "title": "Two Sum", "slug": "two-sum", "difficulty": "Easy", "topic": "Arrays"},
        {"id": "p2", "title": "Valid Palindrome", "slug": "valid-palindrome", "difficulty": "Easy", "topic": "Strings"},
        {"id": "p3", "title": "Maximum Subarray", "slug": "maximum-subarray", "difficulty": "Medium", "topic": "Dynamic Programming"}
    ]

    data = UserDashboardResponse(
        user=UserResponse.from_orm(current_user),
        profile=ProfileResponse.from_orm(profile),
        streak=StreakResponse.from_orm(streak),
        stats={
            "problems_solved": problems_solved,
            "lessons_completed": lessons_completed,
            "dsa_completed": dsa_completed,
            "current_streak_days": streak.current_streak,
            "today_goal": "Solve 1 DSA problem + Complete 1 lesson",
            "today_goal_completed": problems_solved > 0 and lessons_completed > 0
        },
        recommended_lessons=recommended_lessons,
        recommended_problems=recommended_problems,
        career_readiness_breakdown=readiness
    )

    return ApiResponse(success=True, data=data)
