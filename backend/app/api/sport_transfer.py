from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.sport import Sport
from app.models.sport_transfer import SportTransfer
from app.models.user import User
from app.schemas.sport_transfer import (
    SportTransferCreate,
    SportTransferResponse,
)

router = APIRouter(
    prefix="/sport-transfer",
    tags=["Sport Transfer"],
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


@router.get(
    "",
    response_model=list[SportTransferResponse],
)
def get_sport_transfer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(SportTransfer)
        .where(
            SportTransfer.athlete_id == athlete.id
        )
        .order_by(
            SportTransfer.created_at.desc()
        )
    ).all()


@router.post(
    "/calculate",
    response_model=SportTransferResponse,
    status_code=status.HTTP_201_CREATED,
)
def calculate_sport_transfer(
    data: SportTransferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    sport = db.get(
        Sport,
        data.target_sport_id,
    )

    if not sport:
        raise HTTPException(
            status_code=404,
            detail="Target sport not found",
        )

    transfer = SportTransfer(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(transfer)
    db.commit()
    db.refresh(transfer)

    return transfer