from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.coach import (
    CoachMessage,
    CoachRecommendation,
)
from app.models.user import User
from app.schemas.coach import (
    CoachChatRequest,
    CoachMessageResponse,
    CoachRecommendationCreate,
    CoachRecommendationResponse,
)

router = APIRouter(
    prefix="/coach",
    tags=["AI Coach"],
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
    "/chat",
    response_model=CoachMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def coach_chat(
    data: CoachChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    message = CoachMessage(
        athlete_id=athlete.id,
        role="user",
        message=data.message,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.get(
    "/history",
    response_model=list[CoachMessageResponse],
)
def get_coach_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(CoachMessage)
        .where(
            CoachMessage.athlete_id == athlete.id
        )
        .order_by(
            CoachMessage.created_at.asc()
        )
    ).all()


@router.post(
    "/recommendations",
    response_model=CoachRecommendationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_recommendation(
    data: CoachRecommendationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    recommendation = CoachRecommendation(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return recommendation


@router.get(
    "/recommendations",
    response_model=list[CoachRecommendationResponse],
)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(CoachRecommendation)
        .where(
            CoachRecommendation.athlete_id == athlete.id
        )
        .order_by(
            CoachRecommendation.created_at.desc()
        )
    ).all()