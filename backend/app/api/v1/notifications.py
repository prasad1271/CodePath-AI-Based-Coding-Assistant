from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Notification
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=ApiResponse[List[dict]])
def get_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notes = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(20).all()

    if not notes:
        # Default starter notification
        n1 = Notification(
            user_id=current_user.id,
            title="Welcome to CodePath! 🚀",
            message="Your personalized engineering roadmap is active. Begin with Python Fundamentals and solve your first problem.",
            type="info",
            link_url="/learn"
        )
        db.add(n1)
        db.commit()
        db.refresh(n1)
        notes = [n1]

    results = [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "link_url": n.link_url,
            "created_at": n.created_at.isoformat()
        }
        for n in notes
    ]
    return ApiResponse(success=True, data=results)


@router.post("/{notification_id}/read", response_model=ApiResponse[dict])
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if note:
        note.is_read = True
        db.commit()
    return ApiResponse(success=True, data={"status": "marked as read"})


@router.post("/read-all", response_model=ApiResponse[dict])
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return ApiResponse(success=True, data={"status": "all marked as read"})
