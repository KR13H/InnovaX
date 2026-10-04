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


class ShadowChallenge(Base):
    __tablename__ = "shadow_challenges"

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

    sport_id: Mapped[int] = mapped_column(
        ForeignKey(
            "sports.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    metric_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    shadow_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    target_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    current_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )