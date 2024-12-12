from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import relationship, mapped_column, Mapped

from . import Base


class FileAccessORM(Base):
    __tablename__ = "file_access"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_username: Mapped[str] = mapped_column(String(255), ForeignKey("users.username"), nullable=False)
    file_id: Mapped[int] = mapped_column(Integer, ForeignKey("files.id"), nullable=False)

    file = relationship("FileORM", back_populates="file_accesses")
    user = relationship("UserORM", back_populates="file_accesses")
