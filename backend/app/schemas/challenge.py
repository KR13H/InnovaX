from datetime import datetime

from pydantic import BaseModel


class ChallengeCreate(BaseModel):
    title: str
    description: str | None = None
    metric_name: str | None = None
    target_value: float | None = None
    unit: str | None = None


class ChallengeResponse(BaseModel):
    id: int
    creator_athlete_id: int
    title: str
    description: str | None
    metric_name: str | None
    target_value: float | None
    unit: str | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ChallengeParticipantResponse(BaseModel):
    id: int
    challenge_id: int
    athlete_id: int
    progress_value: float | None

    model_config = {
        "from_attributes": True
    }