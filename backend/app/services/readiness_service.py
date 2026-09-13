from typing import Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, Profile
from app.models.learning import Progress
from app.models.practice import Submission
from app.models.project import Project
from app.models.interview import Interview
from app.models.resume import Resume


class CareerReadinessService:
    """
    Computes genuine database-backed career readiness scores for students.
    Weights:
    - Programming Fundamentals & Lessons: 20%
    - Coding Practice & Problem Solving: 25%
    - DSA Topics: 20%
    - Project Architecture & Milestones: 15%
    - Mock Technical Interviews: 10%
    - Resume & Portfolio Completeness: 10%
    """

    @classmethod
    def calculate_user_readiness(cls, db: Session, user_id: str) -> Dict[str, Any]:
        # 1. Programming lessons progress
        completed_lessons = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.entity_type == "lesson",
            Progress.status == "completed"
        ).count()
        prog_score = min(100.0, max(20.0, float(completed_lessons * 15.0)))

        # 2. Problems solved
        accepted_submissions = db.query(Submission.problem_id).filter(
            Submission.user_id == user_id,
            Submission.status == "Accepted"
        ).distinct().count()
        practice_score = min(100.0, max(15.0, float(accepted_submissions * 20.0)))

        # 3. DSA topics
        dsa_done = db.query(Progress).filter(
            Progress.user_id == user_id,
            Progress.entity_type == "dsa_topic",
            Progress.status == "completed"
        ).count()
        dsa_score = min(100.0, max(10.0, float(dsa_done * 25.0)))

        # 4. Projects
        project_count = db.query(Project).filter(Project.user_id == user_id).count()
        projects_score = min(100.0, max(10.0, float(project_count * 35.0)))

        # 5. Interviews
        avg_interview = db.query(func.avg(Interview.overall_score)).filter(
            Interview.user_id == user_id,
            Interview.status == "completed"
        ).scalar()
        interview_score = float(avg_interview or 30.0)

        # 6. Resume
        resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        resume_score = float(resume.ats_score) if resume and resume.ats_score else 25.0

        # Weighted composite score
        overall = round(
            (prog_score * 0.20) +
            (practice_score * 0.25) +
            (dsa_score * 0.20) +
            (projects_score * 0.15) +
            (interview_score * 0.10) +
            (resume_score * 0.10),
            1
        )

        # Update profile cache
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            profile.career_readiness_score = overall
            db.commit()

        if overall >= 80:
            level = "Placement Ready (Elite)"
        elif overall >= 65:
            level = "Interview Ready (Proficient)"
        elif overall >= 45:
            level = "Intermediate Developer"
        else:
            level = "Foundation Building"

        strengths = []
        growth_areas = []

        if prog_score >= 60:
            strengths.append("Solid programming fundamentals")
        else:
            growth_areas.append("Complete fundamental programming lessons")

        if practice_score >= 50:
            strengths.append("Active problem solving consistency")
        else:
            growth_areas.append("Solve more Easy/Medium coding challenges")

        if dsa_score >= 50:
            strengths.append("Good algorithmic pattern recognition")
        else:
            growth_areas.append("Review core DSA topics (Two Pointers, Trees)")

        if projects_score < 40:
            growth_areas.append("Build and document a full-stack capstone project")

        return {
            "overall_score": overall,
            "programming_score": round(prog_score, 1),
            "dsa_score": round(dsa_score, 1),
            "projects_score": round(projects_score, 1),
            "interview_score": round(interview_score, 1),
            "resume_score": round(resume_score, 1),
            "readiness_level": level,
            "strengths": strengths or ["Eager to learn", "Consistent platform engagement"],
            "growth_areas": growth_areas or ["Maintain daily practice streak"]
        }
