from datetime import datetime

from pydantic import BaseModel


class TechniqueReplayCreate(BaseModel):
    issue: str
    body_part: str | None = None
    current_value: float | None = None
    suggested_value: float | None = None
    unit: str | None = None
    recommendation: str | None = None


class TechniqueReplayResponse(BaseModel):
    id: int
    session_id: int
    issue: str
    body_part: str | None
    current_value: float | None
    suggested_value: float | None
    unit: str | None
    recommendation: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }