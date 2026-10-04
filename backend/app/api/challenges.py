from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.challenge import (
    Challenge,
    ChallengeParticipant,
)
from app.models.user import User
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeParticipantResponse,
    ChallengeResponse,
)

router = APIRouter(
    prefix="/challenges",
    tags=["Challenges"],
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
    response_model=ChallengeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_challenge(
    data: ChallengeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    challenge = Challenge(
        creator_athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(challenge)
    db.commit()
    db.refresh(challenge)

    return challenge


@router.get(
    "",
    response_model=list[ChallengeResponse],
)
def get_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.scalars(
        select(Challenge)
        .where(
            Challenge.status == "active"
        )
        .order_by(
            Challenge.created_at.desc()
        )
    ).all()


@router.get(
    "/{challenge_id}",
    response_model=ChallengeResponse,
)
def get_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    challenge = db.get(
        Challenge,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    return challenge


@router.post(
    "/{challenge_id}/join",
    response_model=ChallengeParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def join_challenge(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    challenge = db.get(
        Challenge,
        challenge_id,
    )

    if not challenge:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found",
        )

    existing = db.scalar(
        select(ChallengeParticipant).where(
            ChallengeParticipant.challenge_id
            == challenge_id,
            ChallengeParticipant.athlete_id
            == athlete.id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Already joined challenge",
        )

    participant = ChallengeParticipant(
        challenge_id=challenge_id,
        athlete_id=athlete.id,
    )

    db.add(participant)
    db.commit()
    db.refresh(participant)

    return participant