from datetime import datetime

from pydantic import BaseModel


class HighlightCreate(BaseModel):
    sport_id: int | None = None
    session_id: int | None = None

    title: str

    metric_name: str | None = None
    metric_value: float | None = None
    unit: str | None = None

    highlight_type: str


class HighlightResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int | None
    session_id: int | None
    title: str
    metric_name: str | None
    metric_value: float | None
    unit: str | None
    highlight_type: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }