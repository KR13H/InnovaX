"""Weekly "beat your shadow" tests.

The app projects where the athlete should be a week from now and seals that prediction here.
Predictions stay hidden until the athlete records their next session; then the actual values
are compared. Meeting or beating a prediction counts as beaten. Each resolution also
recalibrates the projection: if the athlete improves more slowly (or faster) than predicted,
the per-metric `calibration` factor scales future projected gains accordingly.
"""

import math
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.session import VideoSession
from app.models.shadow_test import ShadowTest
from app.models.user import User
from app.models.xp import XPEvent

router = APIRouter(prefix="/shadow/tests", tags=["Shadow tests"])

TEST_DAYS = 7
XP_BEATEN = 100
XP_COMPLETED = 25
CALIBRATION_RANGE = (0.25, 1.5)


class Prediction(BaseModel):
    value: float
    lo: float
    hi: float
    baseline: float
    direction: Literal["up", "down", "target"]
    target: float
    label: str = Field(max_length=100)
    unit: str = Field(default="", max_length=20)


class ShadowTestCreate(BaseModel):
    sport: Literal["tennis", "cricket", "basketball", "running"]
    baseline_session_id: int | None = None
    predictions: dict[str, Prediction] = Field(min_length=1, max_length=12)


class ShadowTestResolve(BaseModel):
    session_id: int
    actuals: dict[str, float | None]


def get_athlete(db: Session, user: User) -> AthleteProfile:
    athlete = db.scalar(select(AthleteProfile).where(AthleteProfile.user_id == user.id))
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete profile not found")
    return athlete


def goodness(p: dict, v: float) -> float:
    """Higher is better, whatever the metric's direction."""
    if p["direction"] == "up":
        return v
    if p["direction"] == "down":
        return -v
    return -abs(v - p["target"])


def as_utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def serialize(test: ShadowTest) -> dict:
    sealed = test.status == "open"
    return {
        "id": test.id,
        "sport": test.sport,
        "status": test.status,
        "created_at": test.created_at,
        "due_at": test.due_at,
        "resolved_at": test.resolved_at,
        "baseline_session_id": test.baseline_session_id,
        "resolved_session_id": test.resolved_session_id,
        # While open, only which metrics are being tested is visible, not the predicted values.
        "metrics": [{"key": k, "label": p["label"], "unit": p.get("unit", "")} for k, p in test.predictions.items()],
        "predictions": None if sealed else test.predictions,
        "result": test.result,
    }


def latest_calibration(db: Session, athlete_id: int, sport: str) -> dict[str, float]:
    last = db.scalar(
        select(ShadowTest)
        .where(ShadowTest.athlete_id == athlete_id, ShadowTest.sport == sport, ShadowTest.status == "resolved")
        .order_by(ShadowTest.resolved_at.desc())
        .limit(1)
    )
    return dict((last.result or {}).get("calibration", {})) if last else {}


@router.get("")
def list_tests(
    sport: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(db, current_user)
    query = select(ShadowTest).where(ShadowTest.athlete_id == athlete.id)
    if sport:
        query = query.where(ShadowTest.sport == sport)
    tests = db.scalars(query.order_by(ShadowTest.created_at.desc()).limit(20)).all()
    return [serialize(t) for t in tests]


@router.post("", status_code=status.HTTP_201_CREATED)
def start_test(
    data: ShadowTestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(db, current_user)
    open_test = db.scalar(
        select(ShadowTest).where(
            ShadowTest.athlete_id == athlete.id,
            ShadowTest.sport == data.sport,
            ShadowTest.status == "open",
        )
    )
    if open_test:
        raise HTTPException(status_code=409, detail="A test is already running for this sport")

    test = ShadowTest(
        athlete_id=athlete.id,
        sport=data.sport,
        status="open",
        baseline_session_id=data.baseline_session_id,
        predictions={k: p.model_dump() for k, p in data.predictions.items()},
        due_at=datetime.now(timezone.utc) + timedelta(days=TEST_DAYS),
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return serialize(test)


@router.post("/{test_id}/resolve")
def resolve_test(
    test_id: int,
    data: ShadowTestResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(db, current_user)
    test = db.get(ShadowTest, test_id)
    if not test or test.athlete_id != athlete.id:
        raise HTTPException(status_code=404, detail="Test not found")
    if test.status != "open":
        return serialize(test)

    session = db.get(VideoSession, data.session_id)
    if not session or session.athlete_id != athlete.id:
        raise HTTPException(status_code=404, detail="Session not found")
    if as_utc(session.created_at) <= as_utc(test.created_at):
        raise HTTPException(status_code=422, detail="Record a new session after the test started")

    previous = latest_calibration(db, athlete.id, test.sport)
    metrics: dict[str, dict] = {}
    calibration: dict[str, float] = dict(previous)

    for key, p in test.predictions.items():
        actual = data.actuals.get(key)
        if actual is None or not math.isfinite(actual):
            continue
        beaten = goodness(p, actual) >= goodness(p, p["value"]) - 1e-9
        metrics[key] = {
            "label": p["label"],
            "unit": p.get("unit", ""),
            "baseline": p["baseline"],
            "predicted": p["value"],
            "lo": p["lo"],
            "hi": p["hi"],
            "actual": actual,
            "beaten": beaten,
            "in_range": p["lo"] <= actual <= p["hi"],
        }

        # Recalibrate: compare the gain the athlete actually made with the gain we predicted.
        predicted_gain = goodness(p, p["value"]) - goodness(p, p["baseline"])
        if predicted_gain > 1e-6:
            actual_gain = goodness(p, actual) - goodness(p, p["baseline"])
            ratio = max(0.0, min(2.0, actual_gain / predicted_gain))
            prev = previous.get(key, 1.0)
            lo, hi = CALIBRATION_RANGE
            calibration[key] = round(max(lo, min(hi, 0.5 * prev + 0.5 * ratio)), 3)

    if not metrics:
        raise HTTPException(status_code=422, detail="That session didn't measure any of the tested metrics")

    beaten_count = sum(m["beaten"] for m in metrics.values())
    passed = beaten_count * 2 >= len(metrics)
    xp = XP_BEATEN if passed else XP_COMPLETED

    athlete.xp += xp
    athlete.level = athlete.xp // 1000 + 1
    db.add(XPEvent(athlete_id=athlete.id, amount=xp, reason=f"Shadow test {'beaten' if passed else 'completed'}: {test.sport}"))

    test.status = "resolved"
    test.resolved_session_id = session.id
    test.resolved_at = datetime.now(timezone.utc)
    test.result = {
        "metrics": metrics,
        "beaten": beaten_count,
        "total": len(metrics),
        "passed": passed,
        "calibration": calibration,
        "xp_awarded": xp,
    }
    db.commit()
    db.refresh(test)
    return serialize(test)
