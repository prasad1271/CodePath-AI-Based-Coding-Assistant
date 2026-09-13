from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import CareerPath
from app.schemas.career import CareerPathSummary, CareerPathDetail, CareerReadinessScore
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/career", tags=["Career Roadmaps"])


@router.get("/paths", response_model=ApiResponse[List[CareerPathSummary]])
def list_career_paths(db: Session = Depends(get_db)):
    paths = db.query(CareerPath).all()
    results = [CareerPathSummary.from_orm(p) for p in paths]
    return ApiResponse(success=True, data=results)


@router.get("/paths/{slug}", response_model=ApiResponse[CareerPathDetail])
def get_career_path(slug: str, db: Session = Depends(get_db)):
    path = db.query(CareerPath).filter(CareerPath.slug == slug).first()
    if not path:
        raise HTTPException(status_code=404, detail={"code": "CAREER_PATH_NOT_FOUND", "message": "Career path not found."})
    return ApiResponse(success=True, data=CareerPathDetail.from_orm(path))


@router.get("/readiness", response_model=ApiResponse[CareerReadinessScore])
def get_career_readiness(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data=CareerReadinessScore(**data))
