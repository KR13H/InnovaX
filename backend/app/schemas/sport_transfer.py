from datetime import datetime

from pydantic import BaseModel


class SportTransferCreate(BaseModel):
    source_attribute: str
    source_change: float
    target_sport_id: int
    target_metric: str
    projected_change: float


class SportTransferResponse(BaseModel):
    id: int
    athlete_id: int
    source_attribute: str
    source_change: float
    target_sport_id: int
    target_metric: str
    projected_change: float
    created_at: datetime

    model_config = {
        "from_attributes": True
    }