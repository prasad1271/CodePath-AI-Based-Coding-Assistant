from datetime import datetime, date
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Date, Integer, Numeric, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False, default="student")
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    streak = relationship("Streak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    branch = Column(String(100), nullable=True, default="Computer Science & Engineering")
    academic_year = Column(String(50), nullable=True, default="3rd Year")
    programming_experience = Column(String(50), nullable=True, default="Beginner")
    preferred_language = Column(String(50), nullable=True, default="python")
    current_skill_level = Column(String(50), nullable=True, default="Beginner")
    career_goal = Column(String(100), nullable=True, default="Full Stack Developer")
    daily_available_time = Column(String(50), nullable=True, default="2 hours")
    dsa_experience = Column(String(50), nullable=True, default="Beginner")
    project_experience = Column(String(50), nullable=True, default="None")
    placement_goal = Column(String(255), nullable=True, default="Product-Based Company")
    college = Column(String(255), nullable=True, default="Engineering Institute of Technology")
    degree = Column(String(100), nullable=True, default="B.Tech Computer Science")
    graduation_year = Column(Integer, nullable=True, default=2026)
    bio = Column(String(1000), nullable=True, default="Aspiring software engineer learning algorithms, full-stack development, and system design.")
    skills = Column(JSON, nullable=True, default=lambda: ["Python", "Data Structures", "Next.js", "SQL"])
    github_url = Column(String(255), nullable=True, default="https://github.com")
    linkedin_url = Column(String(255), nullable=True, default="https://linkedin.com")
    portfolio_url = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    career_readiness_score = Column(Numeric(5, 2), default=35.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    email_notifications = Column(Boolean, default=True)
    weekly_digest = Column(Boolean, default=True)
    theme = Column(String(20), default="dark")
    editor_keybindings = Column(String(50), default="standard")
    editor_font_size = Column(Integer, default=14)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")


class Streak(Base):
    __tablename__ = "streaks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_streak = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_activity_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="streak")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(100), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=False)
    badge_icon = Column(String(100), nullable=False)
    xp_reward = Column(Integer, default=50)
    category = Column(String(50), nullable=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    achievement_id = Column(String(36), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow)


class XpTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
