from datetime import datetime

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    creator_athlete_id: Mapped[int] = mapped_column(
        ForeignKey(
            "athlete_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    metric_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    target_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
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
    )


class ChallengeParticipant(Base):
    __tablename__ = "challenge_participants"

    __table_args__ = (
        UniqueConstraint(
            "challenge_id",
            "athlete_id",
            name="uq_challenge_participant",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    challenge_id: Mapped[int] = mapped_column(
        ForeignKey(
            "challenges.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    athlete_id: Mapped[int] = mapped_column(
        ForeignKey(
            "athlete_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    progress_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )