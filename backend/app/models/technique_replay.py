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


class TechniqueReplay(Base):
    __tablename__ = "technique_replays"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey(
            "video_sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    issue: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    body_part: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    current_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    suggested_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    recommendation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )