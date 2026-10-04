from datetime import datetime

from pydantic import BaseModel


class SessionCreate(BaseModel):
    sport_id: int
    video_url: str | None = None
    recorded_at: datetime | None = None


class SessionResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int
    video_url: str | None
    status: str
    recorded_at: datetime | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }