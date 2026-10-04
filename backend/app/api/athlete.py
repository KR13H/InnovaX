from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.user import User
from app.schemas.athlete import (
    AthleteProfileCreate,
    AthleteProfileResponse,
    AthleteProfileUpdate,
)
from app.models.athlete_attribute import AthleteAttribute
from app.schemas.attribute import (
    AthleteAttributeResponse,
    AthleteAttributeUpdate,
)
from app.models.athlete_sport import AthleteSport
from app.models.sport import Sport
from app.models.session import VideoSession
from app.schemas.dashboard import DashboardResponse
from app.models.progress import AthleteProgress
from app.schemas.progress import (
    ProgressSnapshotCreate,
    ProgressSnapshotResponse,
)
from app.models.xp import XPEvent
from app.schemas.xp import (
    XPEventCreate,
    XPEventResponse,
    XPStatusResponse,
)
router = APIRouter(
    prefix="/athlete",
    tags=["Athlete"],
)

def calculate_level_from_xp(xp: int) -> int:
    return (xp // 1000) + 1


def calculate_next_level_xp(level: int) -> int:
    return level * 1000
@router.post(
    "/profile",
    response_model=AthleteProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    data: AthleteProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_profile = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Athlete profile already exists",
        )

    profile = AthleteProfile(
        user_id=current_user.id,
        name=data.name,
        age=data.age,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg,
        experience_level=data.experience_level,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "/profile",
    response_model=AthleteProfileResponse,
)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found",
        )

    return profile


@router.patch(
    "/profile",
    response_model=AthleteProfileResponse,
)
def update_profile(
    data: AthleteProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Athlete profile not found",
        )

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile

@router.get(
    "/attributes",
    response_model=list[AthleteAttributeResponse],
)
def get_attributes(
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
        select(AthleteAttribute).where(
            AthleteAttribute.athlete_id == athlete.id
        )
    ).all()
    
@router.patch(
    "/attributes",
    response_model=list[AthleteAttributeResponse],
)
def update_attributes(
    updates: list[AthleteAttributeUpdate],
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

    results = []

    for update in updates:
        attribute = db.scalar(
            select(AthleteAttribute).where(
                AthleteAttribute.athlete_id == athlete.id,
                AthleteAttribute.attribute_type == update.attribute_type,
            )
        )

        if not attribute:
            attribute = AthleteAttribute(
                athlete_id=athlete.id,
                attribute_type=update.attribute_type,
                current_score=update.current_score,
                peak_score=update.peak_score,
                target_score=update.target_score,
            )

            db.add(attribute)

        else:
            attribute.current_score = update.current_score
            attribute.peak_score = max(
                attribute.peak_score,
                update.current_score,
                update.peak_score,
            )
            attribute.target_score = update.target_score

        results.append(attribute)

    db.commit()

    for attribute in results:
        db.refresh(attribute)

    return results

@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def get_dashboard(
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

    attributes = db.scalars(
        select(AthleteAttribute).where(
            AthleteAttribute.athlete_id == athlete.id
        )
    ).all()

    athlete_sports = db.scalars(
        select(AthleteSport).where(
            AthleteSport.athlete_id == athlete.id
        )
    ).all()

    sport_ids = [
        athlete_sport.sport_id
        for athlete_sport in athlete_sports
    ]

    sports = []

    if sport_ids:
        sports = db.scalars(
            select(Sport).where(
                Sport.id.in_(sport_ids)
            )
        ).all()

    latest_session = db.scalar(
        select(VideoSession)
        .where(
            VideoSession.athlete_id == athlete.id
        )
        .order_by(
            VideoSession.created_at.desc()
        )
        .limit(1)
    )

    return {
        "athlete": athlete,
        "attributes": attributes,
        "sports": sports,
        "latest_session": latest_session,
    }
    
@router.get(
    "/progress",
    response_model=list[ProgressSnapshotResponse],
)
def get_progress(
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

    progress = db.scalars(
        select(AthleteProgress)
        .where(
            AthleteProgress.athlete_id == athlete.id
        )
        .order_by(
            AthleteProgress.recorded_at.asc()
        )
    ).all()

    return progress

@router.post(
    "/progress",
    response_model=ProgressSnapshotResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_progress_snapshot(
    data: ProgressSnapshotCreate,
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

    snapshot = AthleteProgress(
        athlete_id=athlete.id,
        athlete_score=data.athlete_score,
        level=data.level,
        xp=data.xp,
    )

    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)

    return snapshot
@router.get("/archetype")
def get_athlete_archetype():
    raise HTTPException(
        status_code=501,
        detail="Athlete archetype not implemented yet",
    )


@router.get("/versions")
def get_athlete_versions():
    raise HTTPException(
        status_code=501,
        detail="Current, peak and target athlete versions not implemented yet",
    )


@router.get("/heatmap")
def get_athlete_heatmap():
    raise HTTPException(
        status_code=501,
        detail="Athlete heatmap not implemented yet",
    )








    
@router.get(
    "/xp",
    response_model=XPStatusResponse,
)
def get_athlete_xp(
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

    next_level_xp = calculate_next_level_xp(
        athlete.level
    )

    return {
        "xp": athlete.xp,
        "level": athlete.level,
        "xp_for_next_level": next_level_xp,
        "xp_remaining": max(
            next_level_xp - athlete.xp,
            0,
        ),
    }
@router.post(
    "/xp",
    response_model=XPEventResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_athlete_xp(
    data: XPEventCreate,
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

    athlete.xp += data.amount

    athlete.level = calculate_level_from_xp(
        athlete.xp
    )

    event = XPEvent(
        athlete_id=athlete.id,
        amount=data.amount,
        reason=data.reason,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event
@router.get(
    "/xp/history",
    response_model=list[XPEventResponse],
)
def get_xp_history(
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
        select(XPEvent)
        .where(
            XPEvent.athlete_id == athlete.id
        )
        .order_by(
            XPEvent.created_at.desc()
        )
    ).all()
@router.get("/level")
def get_athlete_level(
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

    return {
        "level": athlete.level,
        "xp": athlete.xp,
    }