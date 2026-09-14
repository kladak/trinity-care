"""Application settings for the Trinity Care demo API."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="TRINITY_")

    app_name: str = "Trinity Care Demo API"
    secret_key: str = "trinity-care-demo-secret-not-for-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8
    database_url: str = "sqlite:///./trinity_care.db"
    cors_origins: str = "*"


settings = Settings()
