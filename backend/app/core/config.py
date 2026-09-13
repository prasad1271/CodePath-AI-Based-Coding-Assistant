from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite:///./codepath_dev.db"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://codepath.vercel.app"

    # Supabase Auth & Storage
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder-service-key"
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-key-minimum-32-chars-length"

    # AI Service
    AI_PROVIDER: str = "mock"  # gemini, openai, anthropic, mock
    AI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"
    AI_MAX_TOKENS: int = 1500
    AI_TEMPERATURE: float = 0.7

    # Code Execution Sandbox
    CODE_EXECUTION_TIMEOUT_SECONDS: int = 8
    CODE_EXECUTION_MAX_MEMORY_MB: int = 128
    CODE_EXECUTION_SANDBOX_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
