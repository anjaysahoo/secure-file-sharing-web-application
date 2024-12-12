from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import UserORM
from app.schemas.auth import RegisterSchema
from app.utils.auth import hash_password


async def get_user_by_username(session: AsyncSession, username: str) -> UserORM | None:
    stmt = select(UserORM).where(UserORM.username == username)
    return await session.scalar(stmt)


async def create_user(session: AsyncSession, user_in: RegisterSchema, is_admin: bool) -> UserORM:
    hashed_password = hash_password(user_in.password)
    user_in.password = hashed_password
    user = UserORM(username=user_in.username, hashed_password=user_in.password, is_admin=is_admin)
    session.add(user)
    await session.commit()
    # session.refresh(user)
    return user
