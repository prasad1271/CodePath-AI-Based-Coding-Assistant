from app.core.database import Base
from app.models.user import User, Profile, UserSettings, Streak, Achievement, UserAchievement, XpTransaction, Notification
from app.models.learning import Course, Module, Lesson, LearningPath, Progress, Bookmark
from app.models.practice import Problem, ProblemTestCase, Submission
from app.models.dsa import DsaTopic
from app.models.project import Project, ProjectTask
from app.models.career import CareerPath
from app.models.interview import Interview, InterviewQuestion, InterviewAnswer
from app.models.placement import PlacementTest, PlacementQuestion, PlacementAttempt
from app.models.resume import Resume, GithubProfile
from app.models.community import CommunityPost, CommunityComment, CommunityVote
from app.models.ai import AiConversation, AiMessage, AuditLog

__all__ = [
    "Base",
    "User",
    "Profile",
    "UserSettings",
    "Streak",
    "Achievement",
    "UserAchievement",
    "XpTransaction",
    "Notification",
    "Course",
    "Module",
    "Lesson",
    "LearningPath",
    "Progress",
    "Bookmark",
    "Problem",
    "ProblemTestCase",
    "Submission",
    "DsaTopic",
    "Project",
    "ProjectTask",
    "CareerPath",
    "Interview",
    "InterviewQuestion",
    "InterviewAnswer",
    "PlacementTest",
    "PlacementQuestion",
    "PlacementAttempt",
    "Resume",
    "GithubProfile",
    "CommunityPost",
    "CommunityComment",
    "CommunityVote",
    "AiConversation",
    "AiMessage",
    "AuditLog",
]
