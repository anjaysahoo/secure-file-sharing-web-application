from enum import Enum

from fastapi import HTTPException, Security
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import UserORM, FileORM, FileAccessORM
from app.utils.auth import access_security
from app.utils.auth import is_token_blacklisted


class AccessAction(str, Enum):
    grant = "grant"
    revoke = "revoke"


def get_username_from_credentials(credentials):
    if is_token_blacklisted(credentials.jti):
        raise HTTPException(status_code=401, detail="Access token revoked")
    return credentials.subject["username"]


def is_admin_user(
        credentials: JwtAuthorizationCredentials = Security(access_security)
) -> JwtAuthorizationCredentials:
    if not credentials.subject.get("is_admin", False):
        raise HTTPException(status_code=403, detail="You do not have permission to access this resource")
    return credentials


async def grant_revoke_file_access(
        session: AsyncSession,
        user: UserORM,
        file: FileORM,
        action: AccessAction,
) -> dict:
    result = await session.execute(
        select(FileAccessORM).filter_by(user_username=user.username, file_id=file.id)
    )
    access = result.scalars().first()

    if action == AccessAction.grant:
        if access:
            raise HTTPException(status_code=400, detail="User already has access to this file.")
        new_access = FileAccessORM(user_username=user.username, file_id=file.id)
        session.add(new_access)
        message = f"Access to file '{file.filename}' granted to user {user.username}."
    elif action == AccessAction.revoke:
        if not access:
            raise HTTPException(status_code=400, detail="User does not have access to this file.")
        await session.delete(access)
        message = f"Access to file '{file.filename}' revoked for user {user.username}."
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'grant' or 'revoke'.")

    await session.commit()
    return {"message": message}
