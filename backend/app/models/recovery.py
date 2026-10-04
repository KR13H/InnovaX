from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class RecoveryMetric(Base):
    __tablename__ = "recovery_metrics"

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

    sleep_duration: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    sleep_quality: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    resting_hr: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    hrv: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    fatigue: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    recovery_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )