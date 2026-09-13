from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.dsa import DsaTopic
from app.models.learning import Progress
from app.schemas.dsa import DsaTopicSummary, DsaTopicDetail
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/dsa", tags=["DSA Roadmap"])


@router.get("/topics", response_model=ApiResponse[List[DsaTopicSummary]])
def list_dsa_topics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topics = db.query(DsaTopic).order_by(DsaTopic.order_index).all()
    results = []
    for t in topics:
        is_comp = db.query(Progress).filter(
            Progress.user_id == current_user.id,
            Progress.entity_type == "dsa_topic",
            Progress.entity_id == t.slug,
            Progress.status == "completed"
        ).first() is not None

        item = DsaTopicSummary(
            id=t.id,
            slug=t.slug,
            title=t.title,
            category=t.category,
            order_index=t.order_index,
            visualization_type=t.visualization_type or "array",
            is_completed=is_comp
        )
        results.append(item)
    return ApiResponse(success=True, data=results)


@router.get("/topics/{slug}", response_model=ApiResponse[DsaTopicDetail])
def get_dsa_topic(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    topic = db.query(DsaTopic).filter(DsaTopic.slug == slug).first()
    if not topic:
        raise HTTPException(status_code=404, detail={"code": "TOPIC_NOT_FOUND", "message": "DSA topic not found."})

    is_comp = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "dsa_topic",
        Progress.entity_id == topic.slug,
        Progress.status == "completed"
    ).first() is not None

    data = DsaTopicDetail(
        id=topic.id,
        slug=topic.slug,
        title=topic.title,
        category=topic.category,
        order_index=topic.order_index,
        visualization_type=topic.visualization_type or "array",
        is_completed=is_comp,
        concept_explanation=topic.concept_explanation,
        patterns=topic.patterns or [],
        common_mistakes=topic.common_mistakes or [],
        problem_slugs=topic.problem_slugs or [],
        interview_questions=topic.interview_questions or []
    )
    return ApiResponse(success=True, data=data)


@router.post("/topics/{slug}/complete", response_model=ApiResponse[dict])
def complete_dsa_topic(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prog = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "dsa_topic",
        Progress.entity_id == slug
    ).first()
    if not prog:
        prog = Progress(user_id=current_user.id, entity_type="dsa_topic", entity_id=slug, status="completed")
        db.add(prog)
    else:
        prog.status = "completed"
    db.commit()

    readiness = CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data={"status": "completed", "career_readiness": readiness})
