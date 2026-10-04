from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CoachMessage(Base):
    __tablename__ = "coach_messages"

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

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class CoachRecommendation(Base):
    __tablename__ = "coach_recommendations"

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

    recommendation_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    recommendation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )