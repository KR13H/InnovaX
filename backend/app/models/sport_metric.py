from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SportMetric(Base):
    __tablename__ = "sport_metrics"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey("video_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    metric_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    metric_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )