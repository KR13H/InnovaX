from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.highlight import PerformanceHighlight
from app.models.user import User
from app.schemas.highlight import (
    HighlightCreate,
    HighlightResponse,
)

router = APIRouter(
    prefix="/highlights",
    tags=["Highlights"],
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
    response_model=HighlightResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_highlight(
    data: HighlightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    highlight = PerformanceHighlight(
        athlete_id=athlete.id,
        **data.model_dump(),
    )

    db.add(highlight)
    db.commit()
    db.refresh(highlight)

    return highlight


@router.get(
    "",
    response_model=list[HighlightResponse],
)
def get_highlights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(PerformanceHighlight)
        .where(
            PerformanceHighlight.athlete_id == athlete.id
        )
        .order_by(
            PerformanceHighlight.created_at.desc()
        )
    ).all()


@router.get(
    "/latest",
    response_model=HighlightResponse,
)
def get_latest_highlight(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    highlight = db.scalar(
        select(PerformanceHighlight)
        .where(
            PerformanceHighlight.athlete_id == athlete.id
        )
        .order_by(
            PerformanceHighlight.created_at.desc()
        )
        .limit(1)
    )

    if not highlight:
        raise HTTPException(
            status_code=404,
            detail="No highlights found",
        )

    return highlight