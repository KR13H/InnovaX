from datetime import datetime

from pydantic import BaseModel


class ProgressSnapshotCreate(BaseModel):
    athlete_score: float | None = None
    level: int
    xp: int


class ProgressSnapshotResponse(BaseModel):
    id: int
    athlete_id: int
    athlete_score: float | None
    level: int
    xp: int
    recorded_at: datetime

    model_config = {
        "from_attributes": True
    }