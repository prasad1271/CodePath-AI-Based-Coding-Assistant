from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.schemas.interview import (
    InterviewStartRequest, InterviewSessionResponse, InterviewAnswerSubmit,
    InterviewQuestionResponse
)
from app.schemas.common import ApiResponse
from app.services.ai_service import AIService
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/interviews", tags=["AI Mock Interviews"])


@router.post("/start", response_model=ApiResponse[InterviewSessionResponse])
def start_interview(
    payload: InterviewStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = Interview(
        user_id=current_user.id,
        mode=payload.mode,
        target_role=payload.target_role,
        status="in_progress"
    )
    db.add(interview)
    db.flush()

    # Pre-generate 3 domain questions
    if payload.mode == "HR":
        q_texts = [
            "Tell me about a challenging engineering project where you had to learn a technology on a tight deadline.",
            "How do you handle disagreement with a teammate over technical architecture?",
            "Where do you see your technical trajectory in the next 3 years?"
        ]
    elif payload.mode == "DSA":
        q_texts = [
            "Explain how a Hash Map handles collision resolution internally using Chaining vs Open Addressing.",
            "Compare Quick Sort and Merge Sort in terms of time complexity, stability, and cache locality.",
            "How would you detect a cycle in a singly linked list using constant O(1) space?"
        ]
    else:
        q_texts = [
            f"For a {payload.target_role} role, how do you design a high-throughput REST API that remains resilient under traffic spikes?",
            "Explain the difference between optimistic and pessimistic locking in database transactions.",
            "How do you profile and eliminate memory leaks or slow database queries in production?"
        ]

    for i, q in enumerate(q_texts):
        iq = InterviewQuestion(
            interview_id=interview.id,
            question_text=q,
            question_order=i + 1
        )
        db.add(iq)

    db.commit()
    db.refresh(interview)

    first_q = interview.questions[0] if interview.questions else None
    q_resp = InterviewQuestionResponse(
        id=first_q.id,
        question_text=first_q.question_text,
        question_order=first_q.question_order
    ) if first_q else None

    return ApiResponse(
        success=True,
        data=InterviewSessionResponse(
            id=interview.id,
            mode=interview.mode,
            target_role=interview.target_role,
            status=interview.status,
            current_question=q_resp,
            created_at=interview.created_at
        )
    )


@router.post("/{interview_id}/questions/{question_id}/answer", response_model=ApiResponse[dict])
async def submit_interview_answer(
    interview_id: str,
    question_id: str,
    payload: InterviewAnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail={"code": "INTERVIEW_NOT_FOUND", "message": "Interview not found."})

    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id, InterviewQuestion.interview_id == interview_id).first()
    if not question:
        raise HTTPException(status_code=404, detail={"code": "QUESTION_NOT_FOUND", "message": "Question not found."})

    # AI evaluation
    eval_res = await AIService.evaluate_interview_answer(
        question=question.question_text,
        user_answer=payload.answer_text,
        target_role=interview.target_role
    )

    ans = InterviewAnswer(
        interview_question_id=question.id,
        user_answer_text=payload.answer_text,
        score=eval_res["score"],
        feedback=eval_res["feedback"],
        suggested_answer=eval_res["suggested_answer"]
    )
    db.add(ans)
    db.commit()

    return ApiResponse(
        success=True,
        data={
            "score": eval_res["score"],
            "feedback": eval_res["feedback"],
            "suggested_answer": eval_res["suggested_answer"],
            "strengths": eval_res["strengths"],
            "weaknesses": eval_res["weaknesses"]
        }
    )


@router.post("/{interview_id}/complete", response_model=ApiResponse[InterviewSessionResponse])
def complete_interview(
    interview_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail={"code": "INTERVIEW_NOT_FOUND", "message": "Interview not found."})

    interview.status = "completed"
    interview.completed_at = datetime.utcnow()
    interview.overall_score = 82.0
    interview.technical_score = 85.0
    interview.problem_solving_score = 80.0
    interview.communication_score = 81.0
    interview.confidence_score = 78.0
    interview.strengths = ["Structured thought process", "Good knowledge of core abstractions"]
    interview.weaknesses = ["Could quantify production scale metrics", "Mention concurrency edge cases"]
    interview.feedback_text = "Solid technical performance. Continue practicing deep-dive system design trade-offs."

    db.commit()
    db.refresh(interview)

    CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data=InterviewSessionResponse.from_orm(interview))
