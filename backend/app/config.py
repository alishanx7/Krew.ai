from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Krew AI"
    secret_key: str = "change-me-in-production-krew-ai-2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    database_url: str = "postgresql+asyncpg://krew:krew_secret@localhost:5432/krew_ai"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    fireworks_api_key: str = ""
    fireworks_base_url: str = "https://api.fireworks.ai/inference/v1"
    default_model: str = "accounts/fireworks/models/llama-v3p1-70b-instruct"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 25


settings = Settings()
