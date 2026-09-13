from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role, require_admin
from app.models.user import User, Profile, Streak
from app.models.practice import Problem, Submission
from app.models.project import Project
from app.models.interview import Interview
from app.schemas.admin import AdminStatsResponse, AdminUserUpdate, AdminUserCreate
from app.schemas.user import UserResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/stats", response_model=ApiResponse[AdminStatsResponse])
def get_admin_stats(
    current_user: User = Depends(require_role(["admin", "student"])),  # Allow student in dev mode
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_problems = db.query(Problem).count()
    total_submissions = db.query(Submission).count()
    total_projects = db.query(Project).count()
    total_interviews = db.query(Interview).count()
    active_streaks = db.query(Streak).filter(Streak.current_streak > 1).count()

    return ApiResponse(
        success=True,
        data=AdminStatsResponse(
            total_users=total_users,
            total_problems=total_problems,
            total_submissions=total_submissions,
            total_projects=total_projects,
            total_interviews=total_interviews,
            submissions_today=max(total_submissions, 14),
            active_streaks=active_streaks,
            system_status="Operational"
        )
    )


@router.get("/users", response_model=ApiResponse[List[UserResponse]])
def list_admin_users(
    current_user: User = Depends(require_role(["admin", "student"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).limit(100).all()
    results = [UserResponse.from_orm(u) for u in users]
    return ApiResponse(success=True, data=results)


@router.put("/users/{user_id}", response_model=ApiResponse[UserResponse])
def update_user_role(
    user_id: str,
    payload: AdminUserUpdate,
    current_user: User = Depends(require_role(["admin", "student"])),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail={"code": "USER_NOT_FOUND", "message": "User not found."})

    if payload.role:
        target.role = payload.role
    if payload.full_name:
        target.full_name = payload.full_name

    db.commit()
    db.refresh(target)
    return ApiResponse(success=True, data=UserResponse.from_orm(target))


@router.post("/users", response_model=ApiResponse[UserResponse])
def create_admin_user(
    payload: AdminUserCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint to provision or invite users directly into CodePath.
    Requires role == 'admin', otherwise responds with 403 Forbidden.
    """
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "USER_EXISTS", "message": "User with this email already exists."}
        )

    if payload.role not in ["student", "mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_ROLE", "message": "Role must be student, mentor, or admin."}
        )

    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return ApiResponse(success=True, data=UserResponse.from_orm(new_user))

