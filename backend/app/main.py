from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import Base, engine, get_db, check_db_health
from app.core.logging import logger
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.error_handler import global_exception_handler, validation_exception_handler
from app.services.seed_service import seed_database_if_empty

# Import all API v1 routers
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.learning import router as learning_router
from app.api.v1.practice import router as practice_router
from app.api.v1.ai import router as ai_router
from app.api.v1.dsa import router as dsa_router
from app.api.v1.projects import router as projects_router
from app.api.v1.career import router as career_router
from app.api.v1.interview import router as interview_router
from app.api.v1.placement import router as placement_router
from app.api.v1.resume import router as resume_router
from app.api.v1.github import router as github_router
from app.api.v1.community import router as community_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CodePath backend service...")
    try:
        Base.metadata.create_all(bind=engine)
        from app.core.database import SessionLocal
        with SessionLocal() as db:
            seed_database_if_empty(db)
        logger.info("Database initialization and seed verification complete.")
    except Exception as e:
        logger.error(f"Startup database initialization warning: {e}")
    yield
    logger.info("Shutting down CodePath backend service...")


app = FastAPI(
    title="CodePath API",
    description="AI-Powered Programming & Career Platform Backend for Engineering Students",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares
app.add_middleware(RequestIdMiddleware)
app.add_middleware(RateLimitMiddleware)

# Exception Handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)


# ------------------------------------------------------------
# Render Production Health & Readiness Endpoints
# ------------------------------------------------------------
@app.get("/", tags=["Root"])
def root():
    """
    Root status endpoint displaying API information and docs.
    """
    return {
        "service": "CodePath API",
        "description": "AI-Powered Programming & Career Assistant Backend",
        "status": "operational",
        "docs": "/api/docs",
        "health": "/health",
        "environment": settings.ENVIRONMENT
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Render health check endpoint verifying process vitality.
    """
    return {
        "status": "healthy",
        "service": "codepath-backend",
        "environment": settings.ENVIRONMENT
    }


@app.get("/ready", tags=["Health"])
def readiness_check():
    """
    Render readiness check verifying database and service connectivity.
    """
    db_ok = check_db_health()
    return {
        "status": "ready" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "ai_provider": settings.AI_PROVIDER,
        "sandbox_enabled": settings.CODE_EXECUTION_SANDBOX_ENABLED
    }


# ------------------------------------------------------------
# Mount API v1 Routers
# ------------------------------------------------------------
API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(learning_router, prefix=API_PREFIX)
app.include_router(practice_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(dsa_router, prefix=API_PREFIX)
app.include_router(projects_router, prefix=API_PREFIX)
app.include_router(career_router, prefix=API_PREFIX)
app.include_router(interview_router, prefix=API_PREFIX)
app.include_router(placement_router, prefix=API_PREFIX)
app.include_router(resume_router, prefix=API_PREFIX)
app.include_router(github_router, prefix=API_PREFIX)
app.include_router(community_router, prefix=API_PREFIX)
app.include_router(notifications_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
