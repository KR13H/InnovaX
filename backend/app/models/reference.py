from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SportReferenceRange(Base):
    __tablename__ = "sport_reference_ranges"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    sport_id: Mapped[int] = mapped_column(
        ForeignKey(
            "sports.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    metric_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    level: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    min_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    max_value: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    unit: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )