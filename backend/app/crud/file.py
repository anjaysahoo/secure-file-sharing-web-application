from typing import Sequence

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import FileORM, FileAccessORM
from app.utils.files import remove_file_from_storage


async def create_file_in_db(
        session: AsyncSession,
        filename: str,
        filepath: str,
        owner_username: int
) -> FileORM:
    db_file = FileORM(
        filename=filename,
        filepath=filepath,
        owner_username=owner_username
    )
    session.add(db_file)
    await session.commit()
    # session.refresh(db_file)
    return db_file


async def get_accessible_files_for_user(
        session: AsyncSession,
        user_username: str
) -> Sequence[FileORM]:
    query = (
        select(FileORM)
        .join(FileAccessORM)
        .where(FileAccessORM.user_username == user_username)
    )
    result = await session.execute(query)
    return result.scalars().all()


async def get_file_by_id(session: AsyncSession, file_id: int) -> FileORM | None:
    return await session.get(FileORM, file_id)


async def get_files(session: AsyncSession) -> Sequence[FileORM]:
    result = await session.execute(select(FileORM))
    return result.scalars().all()


async def delete_file_from_db(session: AsyncSession, file_id: int) -> FileORM | None:
    result = await session.execute(select(FileORM).filter_by(id=file_id))
    file = result.scalars().first()

    if not file:
        return None
    try:
        await remove_file_from_storage(file.filepath)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    await session.delete(file)
    await session.commit()

    return file
