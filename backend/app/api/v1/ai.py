from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ai import AiConversation, AiMessage
from app.schemas.ai import (
    AiChatRequest, AiChatResponse, ErrorDoctorRequest, ErrorDoctorResponse,
    AiHintRequest, AiHintResponse
)
from app.schemas.common import ApiResponse
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Mentor & Services"])


@router.post("/chat", response_model=ApiResponse[AiChatResponse])
async def ai_mentor_chat(
    payload: AiChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve or create conversation record
    conv = None
    if payload.conversation_id:
        conv = db.query(AiConversation).filter(
            AiConversation.id == payload.conversation_id,
            AiConversation.user_id == current_user.id
        ).first()

    if not conv:
        conv = AiConversation(
            user_id=current_user.id,
            title=payload.message[:50],
            mode=payload.mode
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Save user message
    user_msg = AiMessage(
        conversation_id=conv.id,
        role="user",
        content=payload.message,
        code_snippet=payload.code_context
    )
    db.add(user_msg)

    # Call AI service
    ai_result = await AIService.chat(
        message=payload.message,
        mode=payload.mode,
        language=payload.language or "python",
        code_context=payload.code_context
    )

    # Save AI response
    ai_msg = AiMessage(
        conversation_id=conv.id,
        role="assistant",
        content=ai_result["response"]
    )
    db.add(ai_msg)
    db.commit()

    return ApiResponse(
        success=True,
        data=AiChatResponse(
            conversation_id=conv.id,
            response=ai_result["response"],
            mode=payload.mode,
            suggested_hints=ai_result.get("suggested_hints", []),
            follow_up_questions=ai_result.get("follow_up_questions", [])
        )
    )


@router.post("/error-doctor", response_model=ApiResponse[ErrorDoctorResponse])
async def error_doctor_diagnosis(
    payload: ErrorDoctorRequest,
    current_user: User = Depends(get_current_user)
):
    diagnosis = await AIService.diagnose_error(
        language=payload.language,
        code=payload.code,
        error_message=payload.error_message
    )
    return ApiResponse(
        success=True,
        data=ErrorDoctorResponse(**diagnosis)
    )


@router.post("/hint", response_model=ApiResponse[AiHintResponse])
async def get_pedagogical_hint(
    payload: AiHintRequest,
    current_user: User = Depends(get_current_user)
):
    hint_data = await AIService.generate_hint(
        problem_title=payload.problem_title,
        student_code=payload.student_code,
        current_issue=payload.current_error_or_issue,
        hints_already_given=payload.hints_already_given
    )
    return ApiResponse(
        success=True,
        data=AiHintResponse(**hint_data)
    )
