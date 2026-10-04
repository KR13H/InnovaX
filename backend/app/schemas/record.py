from datetime import datetime

from pydantic import BaseModel


class PersonalRecordCreate(BaseModel):
    sport_id: int
    metric_name: str
    metric_value: float
    unit: str | None = None


class PersonalRecordResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int
    metric_name: str
    metric_value: float
    unit: str | None
    achieved_at: datetime

    model_config = {
        "from_attributes": True
    }