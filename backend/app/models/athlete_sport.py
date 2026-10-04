from sqlalchemy import Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AthleteSport(Base):
    __tablename__ = "athlete_sports"

    __table_args__ = (
        UniqueConstraint(
            "athlete_id",
            "sport_id",
            name="uq_athlete_sport",
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

    sport_id: Mapped[int] = mapped_column(
        ForeignKey("sports.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )