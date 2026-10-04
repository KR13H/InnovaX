from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.recovery import RecoveryMetric
from app.models.user import User
from app.schemas.recovery import (
    RecoveryCreate,
    RecoveryResponse,
)

router = APIRouter(
    prefix="/recovery",
    tags=["Recovery"],
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
    "",
    response_model=RecoveryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recovery(
    data: RecoveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    recovery = RecoveryMetric(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(recovery)
    db.commit()
    db.refresh(recovery)

    return recovery


@router.get(
    "",
    response_model=list[RecoveryResponse],
)
def get_recovery(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(RecoveryMetric)
        .where(
            RecoveryMetric.athlete_id == athlete.id
        )
        .order_by(
            RecoveryMetric.recorded_at.desc()
        )
    ).all()


@router.get(
    "/latest",
    response_model=RecoveryResponse,
)
def get_latest_recovery(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    recovery = db.scalar(
        select(RecoveryMetric)
        .where(
            RecoveryMetric.athlete_id == athlete.id
        )
        .order_by(
            RecoveryMetric.recorded_at.desc()
        )
        .limit(1)
    )

    if not recovery:
        raise HTTPException(
            status_code=404,
            detail="No recovery data found",
        )

    return recovery


@router.get(
    "/history",
    response_model=list[RecoveryResponse],
)
def get_recovery_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recovery(
        db,
        current_user,
    )