from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AthleteAttribute(Base):
    __tablename__ = "athlete_attributes"

    __table_args__ = (
        UniqueConstraint(
            "athlete_id",
            "attribute_type",
            name="uq_athlete_attribute",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athlete_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    attribute_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    current_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0,
    )

    peak_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0,
    )

    target_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )