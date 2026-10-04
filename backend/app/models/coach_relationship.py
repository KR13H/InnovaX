from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class CoachAthleteRelationship(Base):
    __tablename__ = "coach_athlete_relationships"

    __table_args__ = (
        UniqueConstraint(
            "coach_user_id",
            "athlete_id",
            name="uq_coach_athlete",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    coach_user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
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

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )