from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/shadow",
    tags=["Shadow"],
)


@router.get("/current")
def get_current_shadow():
    raise HTTPException(
        status_code=501,
        detail="Current Shadow not implemented yet",
    )


@router.get("/history")
def get_shadow_history():
    raise HTTPException(
        status_code=501,
        detail="Shadow history not implemented yet",
    )


@router.post("/challenges")
def create_shadow_challenge():
    raise HTTPException(
        status_code=501,
        detail="Shadow challenge creation not implemented yet",
    )


@router.get("/challenges")
def get_shadow_challenges():
    raise HTTPException(
        status_code=501,
        detail="Shadow challenges not implemented yet",
    )


@router.get("/challenges/{challenge_id}")
def get_shadow_challenge(challenge_id: int):
    raise HTTPException(
        status_code=501,
        detail="Shadow challenge not implemented yet",
    )


@router.patch("/challenges/{challenge_id}")
def update_shadow_challenge(challenge_id: int):
    raise HTTPException(
        status_code=501,
        detail="Shadow challenge update not implemented yet",
    )


@router.get("/ghost/{session_id}")
def get_ghost_overlay(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Ghost overlay not implemented yet",
    )