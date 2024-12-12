import os
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import FILE_STORAGE_PATH
from app.models import FileAccessORM


def file_storage_location(filename: str) -> str:
    return str(Path(FILE_STORAGE_PATH) / filename)


def create_unique_filename(filename: str) -> str:
    file_extension = os.path.splitext(filename)[1]
    return f"{uuid.uuid4()}{file_extension}"


async def remove_file_from_storage(filepath: str) -> None:
    if os.path.exists(filepath):
        os.remove(filepath)
    else:
        raise FileNotFoundError(f"File not found at {filepath}")


async def save_file_to_storage(file: UploadFile, location: str) -> None:
    async with aiofiles.open(location, "wb") as f:
        content = await file.read()
        await f.write(content)


async def check_user_access(session: AsyncSession, username: str, file_id: int) -> None:
    has_access = await session.scalar(
        select(FileAccessORM)
        .where(FileAccessORM.file_id == file_id)
        .where(FileAccessORM.user_username == username)
    )
    if not has_access:
        raise HTTPException(status_code=403, detail="Access to this file is forbidden.")
