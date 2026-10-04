from datetime import datetime

from pydantic import BaseModel


class RiskSignalCreate(BaseModel):
    signal_type: str
    severity: str
    message: str
    recommendation: str | None = None


class RiskSignalUpdate(BaseModel):
    status: str


class RiskSignalResponse(BaseModel):
    id: int
    athlete_id: int
    signal_type: str
    severity: str
    message: str
    recommendation: str | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }