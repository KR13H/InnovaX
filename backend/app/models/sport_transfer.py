from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SportTransfer(Base):
    __tablename__ = "sport_transfers"

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

    source_attribute: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    source_change: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    target_sport_id: Mapped[int] = mapped_column(
        ForeignKey(
            "sports.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    target_metric: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    projected_change: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )