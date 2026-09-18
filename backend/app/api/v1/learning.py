from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.learning import Course, Module, Lesson, Progress
from app.schemas.learning import CourseResponse, ModuleResponse, LessonDetailResponse, ProgressUpdate
from app.schemas.ai import AiLessonExplainRequest, AiLessonExplainResponse
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService
from app.services.ai_service import AIService

router = APIRouter(prefix="/learning", tags=["Learning Courses"])


@router.get("/courses", response_model=ApiResponse[List[CourseResponse]])
def get_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.is_published == True).order_by(Course.order_index).all()
    results = []
    for c in courses:
        modules_cnt = len(c.modules)
        lessons_cnt = sum(len(m.lessons) for m in c.modules)
        completed_cnt = db.query(Progress).filter(
            Progress.user_id == current_user.id,
            Progress.entity_type == "lesson",
            Progress.status == "completed"
        ).count()
        item = CourseResponse(
            id=c.id,
            slug=c.slug,
            title=c.title,
            description=c.description,
            language=c.language,
            icon=c.icon,
            difficulty=c.difficulty,
            order_index=c.order_index,
            is_published=c.is_published,
            created_at=c.created_at,
            modules_count=modules_cnt,
            lessons_count=lessons_cnt,
            completed_lessons=min(lessons_cnt, completed_cnt)
        )
        results.append(item)
    return ApiResponse(success=True, data=results)


@router.get("/courses/{course_slug}", response_model=ApiResponse[dict])
def get_course_detail(course_slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.slug == course_slug).first()
    if not course:
        raise HTTPException(status_code=404, detail={"code": "COURSE_NOT_FOUND", "message": "Course not found."})

    modules_data = []
    for m in course.modules:
        lessons_list = []
        for l in m.lessons:
            is_comp = db.query(Progress).filter(
                Progress.user_id == current_user.id,
                Progress.entity_type == "lesson",
                Progress.entity_id == l.slug,
                Progress.status == "completed"
            ).first() is not None
            lessons_list.append({
                "id": l.id,
                "slug": l.slug,
                "title": l.title,
                "order_index": l.order_index,
                "is_completed": is_comp
            })
        modules_data.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "order_index": m.order_index,
            "lessons": lessons_list
        })

    return ApiResponse(
        success=True,
        data={
            "course": CourseResponse.from_orm(course),
            "modules": modules_data
        }
    )


@router.get("/courses/{course_slug}/lessons/{lesson_slug}", response_model=ApiResponse[LessonDetailResponse])
def get_lesson_detail(
    course_slug: str,
    lesson_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.slug == lesson_slug).first()
    if not lesson:
        raise HTTPException(status_code=404, detail={"code": "LESSON_NOT_FOUND", "message": "Lesson not found."})

    is_comp = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "lesson",
        Progress.entity_id == lesson.slug,
        Progress.status == "completed"
    ).first() is not None

    data = LessonDetailResponse(
        id=lesson.id,
        module_id=lesson.module_id,
        slug=lesson.slug,
        title=lesson.title,
        content_markdown=lesson.content_markdown,
        code_snippet=lesson.code_snippet,
        solution_code=lesson.solution_code,
        hints=lesson.hints or [],
        quiz_questions=lesson.quiz_questions or [],
        practice_problem_slug=lesson.practice_problem_slug,
        order_index=lesson.order_index,
        is_completed=is_comp
    )
    return ApiResponse(success=True, data=data)


@router.post("/lessons/{lesson_slug}/complete", response_model=ApiResponse[dict])
def complete_lesson(
    lesson_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.entity_type == "lesson",
        Progress.entity_id == lesson_slug
    ).first()

    if not progress:
        progress = Progress(
            user_id=current_user.id,
            entity_type="lesson",
            entity_id=lesson_slug,
            status="completed"
        )
        db.add(progress)
    else:
        progress.status = "completed"

    db.commit()

    # Recalculate readiness
    readiness = CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data={"status": "completed", "career_readiness": readiness})


@router.post("/lessons/{lesson_slug}/ai-explain", response_model=ApiResponse[AiLessonExplainResponse])
async def ai_explain_lesson(
    lesson_slug: str,
    payload: AiLessonExplainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.slug == lesson_slug).first()
    title = lesson.title if lesson else payload.lesson_title
    content = lesson.content if lesson else payload.lesson_content

    result = await AIService.explain_lesson_concept(
        lesson_title=title,
        lesson_content=content,
        student_question=payload.student_question,
        language=payload.language or "python"
    )

    return ApiResponse(
        success=True,
        data=AiLessonExplainResponse(
            explanation=result["explanation"],
            key_takeaways=result.get("key_takeaways", []),
            sample_code=result.get("sample_code"),
            challenge_question=result.get("challenge_question")
        )
    )
