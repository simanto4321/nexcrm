"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/nexcrm"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_expire_minutes: int = 1440
    # Local open-source LLM via Ollama (free, no API limits)
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:1b"
    ollama_timeout_seconds: int = 120
    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""
    gmail_address: str = ""
    gmail_app_password: str = ""
    # Demo mode: send via local SMTP (no Gmail) — use scripts/run-demo-smtp.ps1
    email_demo_mode: bool = False
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_use_tls: bool = True
    cors_origins: str = "http://localhost:5173,http://localhost:8081"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
