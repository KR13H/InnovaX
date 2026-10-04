from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/progress",
    tags=["Progress"],
)


@router.get("/athlete-score")
def get_athlete_score_progress():
    raise HTTPException(
        status_code=501,
        detail="Athlete score progress not implemented yet",
    )


@router.get("/attributes")
def get_attribute_progress():
    raise HTTPException(
        status_code=501,
        detail="Attribute progress not implemented yet",
    )


@router.get("/sports")
def get_sport_progress():
    raise HTTPException(
        status_code=501,
        detail="Sport progress not implemented yet",
    )


@router.get("/xp")
def get_xp_progress():
    raise HTTPException(
        status_code=501,
        detail="XP progress not implemented yet",
    )


@router.get("/shadow")
def get_shadow_progress():
    raise HTTPException(
        status_code=501,
        detail="Shadow progress not implemented yet",
    )