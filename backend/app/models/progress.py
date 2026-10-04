from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AthleteProgress(Base):
    __tablename__ = "athlete_progress"

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

    athlete_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    level: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    xp: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )