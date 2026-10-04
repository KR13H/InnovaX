from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PerformanceHighlight(Base):
    __tablename__ = "performance_highlights"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    athlete_id: Mapped[int] = mapped_column(
        ForeignKey(
            "athlete_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    sport_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "sports.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    session_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "video_sessions.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    metric_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    metric_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    highlight_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )