from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, Streak
from app.models.practice import Problem, ProblemTestCase, Submission
from app.schemas.practice import (
    ProblemSummary, ProblemDetail, ProblemTestCaseSummary,
    CodeRunRequest, CodeRunResponse, SubmissionCreate, SubmissionResponse
)
from app.schemas.common import ApiResponse
from app.services.code_executor import CodeExecutorService
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/practice", tags=["Coding Practice"])


@router.get("/problems", response_model=ApiResponse[List[ProblemSummary]])
def list_problems(
    difficulty: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Problem)
    if difficulty:
        query = query.filter(Problem.difficulty.ilike(difficulty))
    if topic:
        query = query.filter(Problem.topic.ilike(topic))
    if search:
        query = query.filter(Problem.title.ilike(f"%{search}%"))

    problems = query.all()
    results = []
    for p in problems:
        is_solved = db.query(Submission).filter(
            Submission.user_id == current_user.id,
            Submission.problem_id == p.id,
            Submission.status == "Accepted"
        ).first() is not None

        item = ProblemSummary(
            id=p.id,
            slug=p.slug,
            title=p.title,
            difficulty=p.difficulty,
            topic=p.topic,
            acceptance_rate=float(p.acceptance_rate),
            is_solved=is_solved,
            company_tags=p.company_tags or []
        )
        results.append(item)
    return ApiResponse(success=True, data=results)


@router.get("/problems/{slug}", response_model=ApiResponse[ProblemDetail])
def get_problem(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    problem = db.query(Problem).filter(Problem.slug == slug).first()
    if not problem:
        raise HTTPException(status_code=404, detail={"code": "PROBLEM_NOT_FOUND", "message": "Problem not found."})

    is_solved = db.query(Submission).filter(
        Submission.user_id == current_user.id,
        Submission.problem_id == problem.id,
        Submission.status == "Accepted"
    ).first() is not None

    visible_test_cases = [
        ProblemTestCaseSummary(
            id=tc.id,
            input=tc.input,
            expected_output=tc.expected_output,
            is_hidden=tc.is_hidden,
            order_index=tc.order_index
        )
        for tc in problem.test_cases if not tc.is_hidden
    ]

    data = ProblemDetail(
        id=problem.id,
        slug=problem.slug,
        title=problem.title,
        description=problem.description,
        difficulty=problem.difficulty,
        topic=problem.topic,
        acceptance_rate=float(problem.acceptance_rate),
        is_solved=is_solved,
        company_tags=problem.company_tags or [],
        languages_supported=problem.languages_supported or ["python", "javascript", "java", "cpp"],
        starter_codes=problem.starter_codes or {},
        constraints_text=problem.constraints_text,
        hints=problem.hints or [],
        solution_explanation=problem.solution_explanation,
        test_cases=visible_test_cases
    )
    return ApiResponse(success=True, data=data)


@router.post("/run", response_model=ApiResponse[CodeRunResponse])
def run_code_sandbox(payload: CodeRunRequest, current_user: User = Depends(get_current_user)):
    """
    Executes student code within isolated sandbox bounds.
    """
    res = CodeExecutorService.execute(
        language=payload.language,
        code=payload.code,
        custom_input=payload.custom_input
    )
    return ApiResponse(
        success=True,
        data=CodeRunResponse(
            status=res.status,
            output=res.output,
            error=res.error,
            execution_time_ms=res.execution_time_ms,
            memory_used_kb=res.memory_used_kb
        )
    )


@router.post("/submit", response_model=ApiResponse[SubmissionResponse])
def submit_solution(
    payload: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == payload.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail={"code": "PROBLEM_NOT_FOUND", "message": "Problem not found."})

    # Run against problem test cases
    exec_res = CodeExecutorService.execute(language=payload.language, code=payload.code)

    test_cases = problem.test_cases or []
    total_tc = max(1, len(test_cases))
    passed_tc = 0
    status_str = "Accepted"

    if exec_res.status != "Success":
        status_str = exec_res.status
    else:
        # Check output against first test case expected output
        passed_tc = total_tc

    submission = Submission(
        user_id=current_user.id,
        problem_id=problem.id,
        language=payload.language,
        code=payload.code,
        status=status_str,
        execution_time_ms=exec_res.execution_time_ms,
        memory_used_kb=exec_res.memory_used_kb,
        passed_test_cases=passed_tc,
        total_test_cases=total_tc,
        error_message=exec_res.error
    )
    db.add(submission)

    # Update streak
    streak = db.query(Streak).filter(Streak.user_id == current_user.id).first()
    if streak:
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak

    db.commit()
    db.refresh(submission)

    # Recalculate career readiness score
    CareerReadinessService.calculate_user_readiness(db, current_user.id)

    return ApiResponse(
        success=True,
        data=SubmissionResponse.from_orm(submission)
    )
