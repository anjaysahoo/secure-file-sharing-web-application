import logging
from datetime import timedelta
from pathlib import Path

import redis
from pydantic import BaseModel, Field
from pydantic_settings import SettingsConfigDict, BaseSettings

BASE_DIR = Path(__file__).resolve().parents[2]
DOTENV_PATH = BASE_DIR / ".env"
DOTENV_TEMPLATE_PATH = BASE_DIR / ".env.template"
FILE_STORAGE_PATH = BASE_DIR.parents[0] / "file_storage"


class RunSettings(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000


class CORSSettings(BaseSettings):
    origins: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ]
    allow_credentials: bool = True
    allow_methods: list = ["*"]
    allow_headers: list = ["*"]


class FileLoggerSettings(BaseSettings):
    log_file: str = "file_operations.log"
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - Action: %(action)s - User: %(username)s - File: %(file_name)s"

    def setup(self) -> logging.Logger:
        file_logger = logging.getLogger("file_logger")
        file_handler = logging.FileHandler(self.log_file)
        file_handler.setFormatter(logging.Formatter(self.log_format))

        if not file_logger.hasHandlers():
            file_logger.addHandler(file_handler)
        file_logger.setLevel(getattr(logging, self.log_level.upper()))

        return file_logger


class JWTSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(DOTENV_TEMPLATE_PATH, DOTENV_PATH), extra="allow")

    access_expires_delta: timedelta = timedelta(minutes=15)
    refresh_expires_delta: timedelta = timedelta(days=1)
    access_secret_key: str = Field(alias="ACCESS_SECRET_KEY")
    refresh_secret_key: str = Field(alias="REFRESH_SECRET_KEY")


class RedisSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(DOTENV_TEMPLATE_PATH, DOTENV_PATH), extra="allow")

    host: str = Field(alias="REDIS_HOST")
    port: int = Field(alias="REDIS_PORT")
    db: int = Field(alias="REDIS_DB")

    auth_token_ttl: timedelta = timedelta(days=2)
    token_revoked_status: str = "revoked"


class DatabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(DOTENV_TEMPLATE_PATH, DOTENV_PATH), extra="allow")

    engine: str = Field(alias="DB_ENGINE")
    user: str = Field(alias="MYSQL_ROOT_USER")
    password: str = Field(alias="MYSQL_ROOT_PASSWORD")
    host: str = Field(alias="DB_HOST")
    port: int = Field(alias="DB_PORT")
    name: str = Field(alias="MYSQL_DATABASE")

    echo: bool = True
    max_overflow: int = 10
    pool_size: int = 50

    @property
    def url(self) -> str:
        return f"{self.engine}://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"


class Settings(BaseSettings):
    redis: RedisSettings = RedisSettings()
    database: DatabaseSettings = DatabaseSettings()
    jwt: JWTSettings = JWTSettings()
    run: RunSettings = RunSettings()
    logger: FileLoggerSettings = FileLoggerSettings()
    cors: CORSSettings = CORSSettings()


settings = Settings()
redis_client = redis.StrictRedis(
    host=settings.redis.host,
    port=settings.redis.port,
    db=settings.redis.db,
    decode_responses=True,
)
