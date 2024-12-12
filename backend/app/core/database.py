from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncEngine,
    AsyncSession,
)

from app.core.config import settings


class DatabaseHelper:
    def __init__(
            self,
            url: str,
            echo: bool,
            max_overflow: int,
            pool_size: int,
    ):
        self.engine: AsyncEngine = create_async_engine(
            url=url,
            echo=echo,
            max_overflow=max_overflow,
            pool_size=pool_size,
        )

        self.session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    async def dispose(self) -> None:
        await self.engine.dispose()

    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session_factory() as session:
            yield session


db_helper = DatabaseHelper(
    url=str(settings.database.url),
    echo=settings.database.echo,
    max_overflow=settings.database.max_overflow,
    pool_size=settings.database.pool_size,
)
