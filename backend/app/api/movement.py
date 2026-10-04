from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.movement import MovementBaseline
from app.models.user import User
from app.schemas.movement import (
    MovementBaselineCreate,
    MovementBaselineResponse,
    MovementCompareRequest,
    MovementCompareResponse,
)

router = APIRouter(
    prefix="/movement",
    tags=["Movement"],
)


def get_athlete(
    db: Session,
    current_user: User,
):
    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )

    if not athlete:
        raise HTTPException(
            status_code=404,
            detail="Athlete profile not found",
        )

    return athlete


@router.post(
    "/baseline",
    response_model=MovementBaselineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_movement_baseline(
    data: MovementBaselineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    baseline = MovementBaseline(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(baseline)
    db.commit()
    db.refresh(baseline)

    return baseline


@router.get(
    "/baseline",
    response_model=list[MovementBaselineResponse],
)
def get_movement_baselines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(MovementBaseline).where(
            MovementBaseline.athlete_id == athlete.id
        )
    ).all()


@router.post(
    "/compare",
    response_model=MovementCompareResponse,
)
def compare_movement(
    data: MovementCompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    query = select(
        MovementBaseline
    ).where(
        MovementBaseline.athlete_id == athlete.id,
        MovementBaseline.metric_name == data.metric_name,
    )

    if data.sport_id is not None:
        query = query.where(
            MovementBaseline.sport_id == data.sport_id
        )

    baseline = db.scalar(query)

    if not baseline:
        raise HTTPException(
            status_code=404,
            detail="Movement baseline not found",
        )

    difference = (
        data.current_value
        - baseline.baseline_value
    )

    deviation_detected = False

    if baseline.tolerance is not None:
        deviation_detected = (
            abs(difference)
            > baseline.tolerance
        )

    return {
        "metric_name": data.metric_name,
        "baseline_value": baseline.baseline_value,
        "current_value": data.current_value,
        "difference": difference,
        "tolerance": baseline.tolerance,
        "deviation_detected": deviation_detected,
    }


@router.get("/deviations")
def get_movement_deviations():
    raise HTTPException(
        status_code=501,
        detail="Stored movement deviations not implemented yet",
    )