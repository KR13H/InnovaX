from datetime import datetime

from pydantic import BaseModel, Field


class XPEventCreate(BaseModel):
    amount: int = Field(gt=0)
    reason: str


class XPEventResponse(BaseModel):
    id: int
    athlete_id: int
    amount: int
    reason: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class XPStatusResponse(BaseModel):
    xp: int
    level: int
    xp_for_next_level: int
    xp_remaining: int