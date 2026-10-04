from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.risk_signal import RiskSignal
from app.models.user import User
from app.schemas.risk_signal import (
    RiskSignalCreate,
    RiskSignalResponse,
    RiskSignalUpdate,
)

router = APIRouter(
    prefix="/risk-signals",
    tags=["Risk Signals"],
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
    response_model=RiskSignalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_risk_signal(
    data: RiskSignalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    signal = RiskSignal(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(signal)
    db.commit()
    db.refresh(signal)

    return signal


@router.get(
    "",
    response_model=list[RiskSignalResponse],
)
def get_risk_signals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(RiskSignal)
        .where(
            RiskSignal.athlete_id == athlete.id
        )
        .order_by(
            RiskSignal.created_at.desc()
        )
    ).all()


@router.patch(
    "/{signal_id}",
    response_model=RiskSignalResponse,
)
def update_risk_signal(
    signal_id: int,
    data: RiskSignalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    signal = db.scalar(
        select(RiskSignal).where(
            RiskSignal.id == signal_id,
            RiskSignal.athlete_id == athlete.id,
        )
    )

    if not signal:
        raise HTTPException(
            status_code=404,
            detail="Risk signal not found",
        )

    signal.status = data.status

    db.commit()
    db.refresh(signal)

    return signal