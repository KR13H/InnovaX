from pydantic import BaseModel


class CoachRelationshipCreate(BaseModel):
    athlete_id: int


class CoachRelationshipResponse(BaseModel):
    id: int
    coach_user_id: int
    athlete_id: int

    model_config = {
        "from_attributes": True
    }


class CoachAthleteResponse(BaseModel):
    id: int
    name: str
    athlete_score: float | None
    level: int
    xp: int

    model_config = {
        "from_attributes": True
    }