from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.record import PersonalRecord
from app.models.sport import Sport
from app.models.user import User
from app.schemas.record import (
    PersonalRecordCreate,
    PersonalRecordResponse,
)

router = APIRouter(
    prefix="/records",
    tags=["Personal Records"],
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
    response_model=PersonalRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_record(
    data: PersonalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    record = PersonalRecord(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.get(
    "",
    response_model=list[PersonalRecordResponse],
)
def get_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(PersonalRecord)
        .where(
            PersonalRecord.athlete_id == athlete.id
        )
        .order_by(
            PersonalRecord.achieved_at.desc()
        )
    ).all()


@router.get(
    "/{sport_slug}",
    response_model=list[PersonalRecordResponse],
)
def get_records_by_sport(
    sport_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    sport = db.scalar(
        select(Sport).where(
            Sport.slug == sport_slug
        )
    )

    if not sport:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    return db.scalars(
        select(PersonalRecord).where(
            PersonalRecord.athlete_id == athlete.id,
            PersonalRecord.sport_id == sport.id,
        )
    ).all()