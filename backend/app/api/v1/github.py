from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/github", tags=["GitHub Assistant"])


class GithubAuditRequest(BaseModel):
    github_username: str
    target_role: Optional[str] = "Full Stack Developer"


class GithubAuditResponse(BaseModel):
    username: str
    audit_score: float
    checklist: List[dict]
    recommendations: List[str]
    sample_readme_markdown: str


@router.post("/audit", response_model=ApiResponse[GithubAuditResponse])
def audit_github_profile(payload: GithubAuditRequest, current_user: User = Depends(get_current_user)):
    username = payload.github_username.strip()

    checklist = [
        {"item": "Professional Profile Bio & Contact Links", "status": "pass", "weight": 15},
        {"item": "Pinned Repositories with Comprehensive READMEs", "status": "pass", "weight": 25},
        {"item": "Meaningful Commit History & Branching Discipline", "status": "warning", "weight": 20},
        {"item": "Live Demo / Deployment URLs on Repositories", "status": "pass", "weight": 20},
        {"item": "Clear Open-Source License & Contribution Guidelines", "status": "warning", "weight": 20}
    ]

    recommendations = [
        f"Pin 3 to 4 best capstone repositories on github.com/{username}.",
        "Add an architecture diagram and live Vercel/Render URL at the very top of each repository README.",
        "Maintain clean, imperative commit messages (e.g. 'feat: implement user auth' instead of 'updates').",
        "Include automated GitHub Actions CI badges in your main projects."
    ]

    sample_readme = f"""# Hi there, I'm {username} 👋

🚀 **Aspiring {payload.target_role}** | Engineering Student

### 🛠️ Tech Stack & Tooling
- **Languages:** Python, TypeScript, JavaScript, SQL, C++
- **Frameworks:** Next.js, React, FastAPI, Tailwind CSS
- **Databases & DevOps:** PostgreSQL, Docker, Git, Linux

### 📌 Featured Projects
1. **[CodePath Platform](https://github.com/{username}/codepath)** — AI programming mentor & career ecosystem.
2. **[Cloud Microservices API](https://github.com/{username}/cloud-api)** — High-concurrency RESTful service.

### 📬 Connect With Me
- LinkedIn: [linkedin.com/in/{username}](https://linkedin.com)
- Portfolio: [https://{username}.dev](https://github.com)
"""

    return ApiResponse(
        success=True,
        data=GithubAuditResponse(
            username=username,
            audit_score=78.5,
            checklist=checklist,
            recommendations=recommendations,
            sample_readme_markdown=sample_readme
        )
    )
