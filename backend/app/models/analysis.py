from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SessionAnalysis(Base):
    __tablename__ = "session_analyses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey(
            "video_sessions.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
        index=True,
    )

    performance_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    strongest_metric: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    weakest_metric: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="completed",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )