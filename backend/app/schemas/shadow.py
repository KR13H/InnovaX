from datetime import datetime

from pydantic import BaseModel


class ShadowChallengeCreate(BaseModel):
    sport_id: int
    metric_name: str
    shadow_value: float
    target_value: float


class ShadowChallengeUpdate(BaseModel):
    current_value: float | None = None
    status: str | None = None


class ShadowChallengeResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int
    metric_name: str
    shadow_value: float
    target_value: float
    current_value: float | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }