from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.coach_relationship import (
    CoachAthleteRelationship,
)
from app.models.user import User
from app.schemas.coach_dashboard import (
    CoachAthleteResponse,
    CoachRelationshipCreate,
    CoachRelationshipResponse,
)

router = APIRouter(
    prefix="/coach-dashboard",
    tags=["Coach Dashboard"],
)


@router.post(
    "/relationships",
    response_model=CoachRelationshipResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_relationship(
    data: CoachRelationshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = db.get(
        AthleteProfile,
        data.athlete_id,
    )

    if not athlete:
        raise HTTPException(
            status_code=404,
            detail="Athlete not found",
        )

    existing = db.scalar(
        select(CoachAthleteRelationship).where(
            CoachAthleteRelationship.coach_user_id
            == current_user.id,
            CoachAthleteRelationship.athlete_id
            == athlete.id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Relationship already exists",
        )

    relationship = CoachAthleteRelationship(
        coach_user_id=current_user.id,
        athlete_id=athlete.id,
    )

    db.add(relationship)
    db.commit()
    db.refresh(relationship)

    return relationship


@router.get(
    "/athletes",
    response_model=list[CoachAthleteResponse],
)
def get_coach_athletes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.scalars(
        select(AthleteProfile)
        .join(
            CoachAthleteRelationship,
            CoachAthleteRelationship.athlete_id
            == AthleteProfile.id,
        )
        .where(
            CoachAthleteRelationship.coach_user_id
            == current_user.id
        )
    ).all()


@router.get(
    "/athletes/{athlete_id}",
    response_model=CoachAthleteResponse,
)
def get_coach_athlete(
    athlete_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = db.scalar(
        select(AthleteProfile)
        .join(
            CoachAthleteRelationship,
            CoachAthleteRelationship.athlete_id
            == AthleteProfile.id,
        )
        .where(
            CoachAthleteRelationship.coach_user_id
            == current_user.id,
            AthleteProfile.id == athlete_id,
        )
    )

    if not athlete:
        raise HTTPException(
            status_code=404,
            detail="Athlete not found or not assigned to coach",
        )

    return athlete


@router.delete(
    "/relationships/{athlete_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_relationship(
    athlete_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    relationship = db.scalar(
        select(CoachAthleteRelationship).where(
            CoachAthleteRelationship.coach_user_id
            == current_user.id,
            CoachAthleteRelationship.athlete_id
            == athlete_id,
        )
    )

    if not relationship:
        raise HTTPException(
            status_code=404,
            detail="Relationship not found",
        )

    db.delete(relationship)
    db.commit()