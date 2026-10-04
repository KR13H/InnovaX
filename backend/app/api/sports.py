from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.athlete_sport import AthleteSport
from app.models.sport import Sport
from app.models.user import User
from app.schemas.sport import (
    AthleteSportCreate,
    AthleteSportResponse,
    SportResponse,
)
from app.models.reference import SportReferenceRange
from app.schemas.reference import ReferenceRangeResponse

router = APIRouter(
    tags=["Sports"],
)


@router.get(
    "/sports",
    response_model=list[SportResponse],
)
def get_sports(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Sport).order_by(Sport.name)
    ).all()


@router.post(
    "/athlete/sports",
    response_model=AthleteSportResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_athlete_sport(
    data: AthleteSportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    sport = db.get(Sport, data.sport_id)

    if not sport:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    existing = db.scalar(
        select(AthleteSport).where(
            AthleteSport.athlete_id == athlete.id,
            AthleteSport.sport_id == data.sport_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Sport already added",
        )

    athlete_sport = AthleteSport(
        athlete_id=athlete.id,
        sport_id=data.sport_id,
        is_primary=data.is_primary,
    )

    db.add(athlete_sport)
    db.commit()
    db.refresh(athlete_sport)

    return athlete_sport


@router.get(
    "/athlete/sports",
    response_model=list[AthleteSportResponse],
)
def get_athlete_sports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    return db.scalars(
        select(AthleteSport).where(
            AthleteSport.athlete_id == athlete.id
        )
    ).all()
    
@router.delete("/athlete/sports/{sport_id}")
def remove_athlete_sport(sport_id: int):
    raise HTTPException(
        status_code=501,
        detail="Removing athlete sport not implemented yet",
    )


@router.get("/sports/{sport_slug}/stats")
def get_sport_stats(sport_slug: str):
    raise HTTPException(
        status_code=501,
        detail="Sport statistics not implemented yet",
    )


@router.get("/sports/{sport_slug}/history")
def get_sport_history(sport_slug: str):
    raise HTTPException(
        status_code=501,
        detail="Sport history not implemented yet",
    )


@router.get(
    "/sports/{sport_slug}/reference",
    response_model=list[ReferenceRangeResponse],
)
def get_sport_reference(
    sport_slug: str,
    db: Session = Depends(get_db),
):
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
        select(SportReferenceRange).where(
            SportReferenceRange.sport_id == sport.id
        )
    ).all()