from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ShadowTest(Base):
    """A weekly "beat your shadow" test.

    When it starts, the app's projection of where the athlete will be in a week is sealed in
    `predictions` (hidden from the API until resolved). The next analyzed session is compared
    against it; the outcome and the projection's recalibration are stored in `result`.
    """

    __tablename__ = "shadow_tests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    athlete_id: Mapped[int] = mapped_column(
        ForeignKey("athlete_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sport: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="open", nullable=False)
    baseline_session_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resolved_session_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # {metric_key: {value, lo, hi, baseline, direction, target, label, unit}}
    predictions: Mapped[dict] = mapped_column(JSON, nullable=False)
    # {metrics: {key: {...}}, beaten, total, passed, calibration: {key: factor}, xp_awarded}
    result: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
