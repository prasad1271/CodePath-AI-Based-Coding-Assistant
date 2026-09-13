import jwt
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.config import settings
from app.core.database import get_db
from app.core.logging import logger

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer(auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


def decode_supabase_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies a Supabase Auth JWT token.
    Supports development/mock mode when running locally without live Supabase keys.
    """
    try:
        # First attempt standard decode with Supabase secret
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        return payload
    except jwt.InvalidTokenError:
        # In development/test mode, accept mock or unverified dev tokens
        if settings.ENVIRONMENT in ["development", "test"]:
            try:
                unverified = jwt.decode(token, options={"verify_signature": False})
                return unverified
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Authentication token is invalid or expired."}
        )


def get_current_user_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    if not credentials:
        # Fallback guest user in dev mode if explicitly permitted
        if settings.ENVIRONMENT in ["development", "test"]:
            return {
                "sub": "00000000-0000-0000-0000-000000000001",
                "email": "student@codepath.dev",
                "role": "student",
                "user_metadata": {"full_name": "Demo Engineering Student"}
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "AUTH_REQUIRED", "message": "Authentication token required."}
        )
    return decode_supabase_token(credentials.credentials)


def get_current_user(
    payload: Dict[str, Any] = Depends(get_current_user_token_payload),
    db: Session = Depends(get_db)
):
    from app.models.user import User, Profile, UserSettings
    user_id = payload.get("sub")
    email = payload.get("email", "unknown@codepath.dev")
    user_meta = payload.get("user_metadata", {})
    full_name = user_meta.get("full_name", email.split("@")[0].capitalize())

    # Find or auto-sync user from Supabase token
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Check by email
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Strict role security rule:
            # - Student registration strictly defaults to 'student'
            # - Mentor is controlled/invited (via protected app_metadata or DB)
            # - Admin is manually created/controlled
            # Client metadata cannot self-assign 'admin' or 'mentor'
            app_meta = payload.get("app_metadata", {})
            assigned_role = app_meta.get("role")
            if assigned_role not in ["student", "mentor", "admin"]:
                user_meta_role = user_meta.get("role") or payload.get("role")
                if user_meta_role in ["student"]:
                    assigned_role = "student"
                else:
                    assigned_role = "student"

            user = User(
                id=user_id,
                email=email,
                full_name=full_name,
                role=assigned_role
            )
            db.add(user)
            db.flush()

            # Create default profile and settings
            profile = Profile(
                user_id=user.id,
                branch="Computer Science & Engineering",
                academic_year="3rd Year",
                preferred_language="python",
                career_goal="Full Stack Developer",
                career_readiness_score=35.00
            )
            settings_obj = UserSettings(user_id=user.id)
            db.add(profile)
            db.add(settings_obj)
            db.commit()
            db.refresh(user)

    return user


def require_role(allowed_roles: list[str]):
    def role_checker(user=Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Access forbidden: insufficient permissions."}
            )
        return user
    return role_checker


def require_student(user=Depends(get_current_user)):
    """
    Ensures the authenticated user has student permissions (student, mentor, or admin).
    """
    if user.role not in ["student", "mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Access forbidden: student permissions required."}
        )
    return user


def require_mentor(user=Depends(get_current_user)):
    """
    Ensures the authenticated user has mentor or admin permissions.
    """
    if user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Access forbidden: mentor role required."}
        )
    return user


def require_admin(user=Depends(get_current_user)):
    """
    Ensures the authenticated user has admin role.
    """
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Access forbidden: admin role required."}
        )
    return user

