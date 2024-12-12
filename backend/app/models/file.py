from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import relationship, mapped_column, Mapped

from . import Base


class FileORM(Base):
    __tablename__ = "files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(100), nullable=False)
    filepath: Mapped[str] = mapped_column(String(200), nullable=False)
    owner_username: Mapped[int] = mapped_column(ForeignKey("users.username"))
    download_count: Mapped[int] = mapped_column(default=0, nullable=False)

    owner = relationship("UserORM", back_populates="files")
    file_accesses = relationship("FileAccessORM", back_populates="file", cascade="all, delete-orphan")
