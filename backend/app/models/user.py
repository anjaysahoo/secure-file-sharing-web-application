from sqlalchemy import String
from sqlalchemy.orm import relationship, mapped_column, Mapped

from . import Base


class UserORM(Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(
        String(50), primary_key=True, unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[bytes] = mapped_column(nullable=False)
    is_admin: Mapped[bool] = mapped_column(default=False)
    download_count: Mapped[int] = mapped_column(default=0, nullable=False)

    files = relationship("FileORM", back_populates="owner")
    file_accesses = relationship("FileAccessORM", back_populates="user")
