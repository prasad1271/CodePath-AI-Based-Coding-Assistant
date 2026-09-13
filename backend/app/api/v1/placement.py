from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.placement import PlacementTest, PlacementQuestion, PlacementAttempt
from app.schemas.placement import (
    PlacementTestSummary, PlacementTestDetail, PlacementQuestionSummary,
    PlacementSubmitRequest, PlacementResultResponse
)
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/placement", tags=["Placement Preparation"])


@router.get("/tests", response_model=ApiResponse[List[PlacementTestSummary]])
def list_placement_tests(db: Session = Depends(get_db)):
    tests = db.query(PlacementTest).all()
    results = [PlacementTestSummary.from_orm(t) for t in tests]
    return ApiResponse(success=True, data=results)


@router.get("/tests/{test_id}", response_model=ApiResponse[PlacementTestDetail])
def get_placement_test(test_id: str, db: Session = Depends(get_db)):
    test = db.query(PlacementTest).filter(PlacementTest.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail={"code": "TEST_NOT_FOUND", "message": "Placement test not found."})

    questions_list = [
        PlacementQuestionSummary(
            id=q.id,
            subject=q.subject,
            question_text=q.question_text,
            options=q.options or []
        )
        for q in test.questions
    ]

    data = PlacementTestDetail(
        id=test.id,
        title=test.title,
        category=test.category,
        time_limit_minutes=test.time_limit_minutes,
        total_questions=test.total_questions,
        questions=questions_list
    )
    return ApiResponse(success=True, data=data)


@router.post("/submit", response_model=ApiResponse[PlacementResultResponse])
def submit_placement_test(
    payload: PlacementSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    test = db.query(PlacementTest).filter(PlacementTest.id == payload.test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail={"code": "TEST_NOT_FOUND", "message": "Placement test not found."})

    total = len(test.questions)
    correct = 0
    breakdown = {}
    explanations = []

    for q in test.questions:
        user_choice = payload.answers.get(q.id)
        is_right = (user_choice == q.correct_option_index)
        if is_right:
            correct += 1

        subj = q.subject
        if subj not in breakdown:
            breakdown[subj] = {"total": 0, "correct": 0}
        breakdown[subj]["total"] += 1
        if is_right:
            breakdown[subj]["correct"] += 1

        explanations.append({
            "question_id": q.id,
            "subject": q.subject,
            "question_text": q.question_text,
            "user_choice": user_choice,
            "correct_option_index": q.correct_option_index,
            "is_correct": is_right,
            "explanation": q.explanation
        })

    score = float(correct * 10)
    total_score = float(total * 10)
    percentage = round((score / total_score) * 100.0 if total_score > 0 else 0.0, 1)

    attempt = PlacementAttempt(
        user_id=current_user.id,
        test_id=test.id,
        score=score,
        total_score=total_score,
        percentage=percentage,
        answers=payload.answers
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    CareerReadinessService.calculate_user_readiness(db, current_user.id)

    return ApiResponse(
        success=True,
        data=PlacementResultResponse(
            attempt_id=attempt.id,
            score=score,
            total_score=total_score,
            percentage=percentage,
            subject_breakdown=breakdown,
            explanations=explanations
        )
    )
