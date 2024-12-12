from typing import Any

from bcrypt import hashpw, gensalt, checkpw
from fastapi_jwt import JwtAccessBearer, JwtRefreshBearer

from app.core.config import settings, redis_client

access_security = JwtAccessBearer(
    secret_key=settings.jwt.access_secret_key,
    access_expires_delta=settings.jwt.access_expires_delta,
)

refresh_security = JwtRefreshBearer(
    secret_key=settings.jwt.refresh_secret_key,
    refresh_expires_delta=settings.jwt.refresh_expires_delta,
)


def add_token_to_blacklist(token_jti):
    redis_client.setex(
        f"blacklist:{token_jti}",
        settings.redis.auth_token_ttl,
        settings.redis.token_revoked_status,
    )


def is_token_blacklisted(jti: str) -> bool:
    return redis_client.exists(f"blacklist:{jti}") > 0


def create_access_refresh_pair(subject: Any) -> tuple:
    access_token = access_security.create_access_token(subject)
    refresh_token = refresh_security.create_refresh_token(subject)

    return access_token, refresh_token


def hash_password(password: str) -> bytes:
    return hashpw(password=password.encode(), salt=gensalt())


def verify_password(password: str, hashed_password: bytes) -> bool:
    return checkpw(password=password.encode(), hashed_password=hashed_password)
