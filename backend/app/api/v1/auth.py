from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=ApiResponse[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    return ApiResponse(
        success=True,
        data=UserResponse.from_orm(current_user)
    )


@router.post("/sync", response_model=ApiResponse[UserResponse])
def sync_supabase_user(current_user: User = Depends(get_current_user)):
    """
    Called upon client sign-in to ensure Supabase identity is synced in local PostgreSQL.
    """
    return ApiResponse(
        success=True,
        data=UserResponse.from_orm(current_user)
    )
