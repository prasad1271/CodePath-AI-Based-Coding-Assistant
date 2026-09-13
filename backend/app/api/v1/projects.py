from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project, ProjectTask
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectGenerateRequest, ProjectTaskResponse
from app.schemas.common import ApiResponse
from app.services.readiness_service import CareerReadinessService

router = APIRouter(prefix="/projects", tags=["Project Mentor"])


@router.get("", response_model=ApiResponse[List[ProjectResponse]])
def get_user_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()
    results = [ProjectResponse.from_orm(p) for p in projects]
    return ApiResponse(success=True, data=results)


@router.post("", response_model=ApiResponse[ProjectResponse])
def create_project(payload: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = Project(
        user_id=current_user.id,
        title=payload.title,
        category=payload.category,
        difficulty=payload.difficulty,
        description=payload.description,
        architecture_overview=payload.architecture_overview or "Frontend (Next.js) -> REST API (FastAPI) -> PostgreSQL Database",
        tech_stack=payload.tech_stack or ["Next.js", "FastAPI", "PostgreSQL", "Docker"],
        database_design=payload.database_design or "Users, Products, Orders, OrderItems normalized schema",
        api_design=payload.api_design or "POST /api/v1/auth/register\nGET /api/v1/items\nPOST /api/v1/orders",
        folder_structure=payload.folder_structure or "frontend/\nbackend/\ndocker-compose.yml",
        readme_content=payload.readme_content or f"# {payload.title}\n\n{payload.description}",
        resume_bullets=payload.resume_bullets or [
            f"Architected scalable {payload.category} application using {', '.join(payload.tech_stack[:3])}.",
            "Engineered normalized relational database schema and secured RESTful endpoints.",
            "Containerized deployment using Docker and configured continuous integration."
        ]
    )
    db.add(project)
    db.flush()

    # Create default milestone tasks
    tasks = [
        ProjectTask(project_id=project.id, title="Define Database Schema & Relationships", milestone="Phase 1: Architecture", order_index=1),
        ProjectTask(project_id=project.id, title="Implement REST API Endpoints & Auth", milestone="Phase 2: Backend Core", order_index=2),
        ProjectTask(project_id=project.id, title="Build Responsive Frontend UI & Forms", milestone="Phase 3: Client Experience", order_index=3),
        ProjectTask(project_id=project.id, title="Write Comprehensive Tests & Deploy to Vercel/Render", milestone="Phase 4: Production Deployment", order_index=4)
    ]
    db.add_all(tasks)
    db.commit()
    db.refresh(project)

    CareerReadinessService.calculate_user_readiness(db, current_user.id)
    return ApiResponse(success=True, data=ProjectResponse.from_orm(project))


@router.post("/generate", response_model=ApiResponse[ProjectCreate])
def generate_project_idea(payload: ProjectGenerateRequest, current_user: User = Depends(get_current_user)):
    """
    AI Project Mentor generator producing structured architecture, database schemas, and resume bullets.
    """
    cat = payload.category
    diff = payload.difficulty

    if cat == "AI/ML":
        title = "Intelligent Resume Scanner & Skill Gap Analyzer"
        desc = "Full-stack application analyzing technical resumes against live job descriptions using vector embeddings and LLMs."
        tech = ["Python", "FastAPI", "LangChain", "ChromaDB", "Next.js", "Tailwind CSS", "Docker"]
    elif cat == "Cybersecurity":
        title = "Automated Web Vulnerability & Header Security Scanner"
        desc = "Security auditing platform checking target websites for OWASP Top 10 vulnerabilities, missing security headers, and open ports."
        tech = ["Python", "FastAPI", "Nmap Library", "Next.js", "PostgreSQL", "Docker"]
    else:
        title = "Cloud-Native Collaborative Code Review Platform"
        desc = "Modern web application enabling engineering students to submit code snippets, receive AI and peer reviews, and track syntax metrics."
        tech = ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Monaco Editor", "Tailwind CSS"]

    idea = ProjectCreate(
        title=title,
        category=cat,
        difficulty=diff,
        description=desc,
        architecture_overview="Next.js Client -> FastAPI REST API -> Worker Queue -> PostgreSQL / Vector Storage",
        tech_stack=tech,
        database_design="users(id, email, role), projects(id, user_id, title), audits(id, project_id, status, findings_json)",
        api_design="POST /api/v1/scan\nGET /api/v1/scans/{id}\nPOST /api/v1/reports",
        folder_structure="frontend/\n  app/\n  components/\nbackend/\n  app/api/\n  app/services/\ndocker-compose.yml",
        readme_content=f"# {title}\n\n{desc}\n\n## Tech Stack\n- " + "\n- ".join(tech),
        resume_bullets=[
            f"Designed and deployed {title} using {', '.join(tech[:3])}.",
            "Architected decoupled microservices architecture with automated containerization.",
            "Optimized query performance and reduced API response latency by 35%."
        ]
    )
    return ApiResponse(success=True, data=idea)


@router.get("/{project_id}", response_model=ApiResponse[ProjectResponse])
def get_project_by_id(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail={"code": "PROJECT_NOT_FOUND", "message": "Project workspace not found."})
    return ApiResponse(success=True, data=ProjectResponse.from_orm(project))


@router.delete("/{project_id}", response_model=ApiResponse[dict])
def delete_project_by_id(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail={"code": "PROJECT_NOT_FOUND", "message": "Project workspace not found."})
    db.delete(project)
    db.commit()
    return ApiResponse(success=True, data={"message": "Project deleted successfully"})


@router.post("/{project_id}/tasks/{task_id}/toggle", response_model=ApiResponse[dict])
def toggle_project_task(
    project_id: str,
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail={"code": "PROJECT_NOT_FOUND", "message": "Project workspace not found."})

    task = db.query(ProjectTask).filter(ProjectTask.id == task_id, ProjectTask.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"code": "TASK_NOT_FOUND", "message": "Task not found."})

    task.is_completed = not task.is_completed
    db.commit()
    return ApiResponse(success=True, data={"task_id": task.id, "is_completed": task.is_completed})
