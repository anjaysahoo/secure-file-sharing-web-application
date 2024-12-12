from typing import List

from bcrypt import checkpw
from fastapi import APIRouter, Depends, status, Security, HTTPException
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import db_helper
from app.crud.file import get_file_by_id
from app.crud.user import get_user_by_username, create_user
from app.models import UserORM
from app.schemas.auth import RegisterSchema, LoginResponse, LoginSchema, TokenResponse
from app.schemas.user import (
    UserStatisticsSchema,
    UserResponseSchema,
    GrantFileAccessRequest,
    GrantAdminRequest,
)
from app.utils.auth import (
    refresh_security,
    is_token_blacklisted,
    create_access_refresh_pair,
    add_token_to_blacklist,
)
from app.utils.users import is_admin_user, grant_revoke_file_access

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


# @router.post(
#     "/register",
#     response_model=UserResponseSchema,
#     status_code=status.HTTP_201_CREATED
# )
# async def register(
#         user_in: RegisterSchema,
#         session: AsyncSession = Depends(db_helper.get_async_session)
# ):
#     user = await get_user_by_username(session, user_in.username)
#     if user is not None:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail={"error_code": "username_already_taken",
#                     "message": "The username is already taken. Please choose a different one."}
#         )
#
#     new_user = await create_user(session=session, user_in=user_in)
#     return new_user


@router.post(
    "/register",
    response_model=UserResponseSchema,
    status_code=status.HTTP_201_CREATED
)
async def register(
        user_in: RegisterSchema,
        session: AsyncSession = Depends(db_helper.get_async_session)
):
    user = await get_user_by_username(session, user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error_code": "username_already_taken",
                    "message": "The username is already taken. Please choose a different one."}
        )

    result = await session.execute(select(UserORM))
    users_count = len(result.scalars().all())

    is_admin = users_count == 0

    new_user = await create_user(session=session, user_in=user_in, is_admin=is_admin)
    return new_user


@router.post("/login", response_model=LoginResponse)
async def login(
        user: LoginSchema,
        session: AsyncSession = Depends(db_helper.get_async_session)
) -> LoginResponse:
    user_db = await get_user_by_username(session=session, username=user.username)

    if user_db is None or not checkpw(
            password=user.password.encode(),
            hashed_password=user_db.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    subject = {"username": user.username, "is_admin": user_db.is_admin}
    access_token, refresh_token = create_access_refresh_pair(subject=subject)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        is_admin=user_db.is_admin,
        username=user_db.username,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(credentials: JwtAuthorizationCredentials = Security(refresh_security)):
    if is_token_blacklisted(credentials.jti):
        raise HTTPException(status_code=401, detail="Refresh token revoked")

    add_token_to_blacklist(credentials.jti)
    access_token, refresh_token = create_access_refresh_pair(credentials.jti)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )


@router.post("/logout")
async def logout(credentials: JwtAuthorizationCredentials = Security(refresh_security)) -> dict:
    add_token_to_blacklist(credentials.jti)
    return {"message": "Successfully logged out"}


@router.get("/user-statistics", response_model=List[UserStatisticsSchema])
async def get_user_statistics(
        credentials: JwtAuthorizationCredentials = Depends(is_admin_user),
        session: AsyncSession = Depends(db_helper.get_async_session),
) -> list:
    result = await session.execute(
        select(UserORM)
    )
    users = result.scalars().all()

    return [
        UserStatisticsSchema(
            username=user.username,
            is_admin=user.is_admin,
            download_count=user.download_count
        )
        for user in users
    ]


@router.post("/grant-admin/")
async def grant_admin(
        request: GrantAdminRequest,
        credentials: JwtAuthorizationCredentials = Depends(is_admin_user),
        session: AsyncSession = Depends(db_helper.get_async_session),
) -> dict:
    user = await get_user_by_username(session, request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_admin = True
    await session.commit()
    return {"message": f"User {request.username} has been granted admin rights."}


@router.post("/file-access/")
async def manage_file_access(
        request: GrantFileAccessRequest,
        credentials: JwtAuthorizationCredentials = Depends(is_admin_user),
        session: AsyncSession = Depends(db_helper.get_async_session),
) -> dict:
    file = await get_file_by_id(session=session, file_id=request.file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    user = await get_user_by_username(session=session, username=request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return await grant_revoke_file_access(
        session=session,
        user=user,
        file=file,
        action=request.action,
    )
