from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.achievement import (
    Achievement,
    AthleteAchievement,
)
from app.models.athlete import AthleteProfile
from app.models.user import User
from app.schemas.achievement import (
    AchievementResponse,
    AchievementUnlock,
    AthleteAchievementResponse,
)

router = APIRouter(
    prefix="/achievements",
    tags=["Achievements"],
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
    response_model=list[AchievementResponse],
)
def get_achievements(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Achievement)
    ).all()


@router.get(
    "/unlocked",
    response_model=list[AthleteAchievementResponse],
)
def get_unlocked_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(AthleteAchievement).where(
            AthleteAchievement.athlete_id == athlete.id
        )
    ).all()


@router.post(
    "/unlock",
    response_model=AthleteAchievementResponse,
    status_code=status.HTTP_201_CREATED,
)
def unlock_achievement(
    data: AchievementUnlock,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    achievement = db.get(
        Achievement,
        data.achievement_id,
    )

    if not achievement:
        raise HTTPException(
            status_code=404,
            detail="Achievement not found",
        )

    existing = db.scalar(
        select(AthleteAchievement).where(
            AthleteAchievement.athlete_id == athlete.id,
            AthleteAchievement.achievement_id == data.achievement_id,
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Achievement already unlocked",
        )

    unlocked = AthleteAchievement(
        athlete_id=athlete.id,
        achievement_id=data.achievement_id,
    )

    db.add(unlocked)
    db.commit()
    db.refresh(unlocked)

    return unlocked