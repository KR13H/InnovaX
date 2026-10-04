from datetime import datetime

from pydantic import BaseModel


class PerformanceExplanationCreate(BaseModel):
    title: str
    explanation: str
    recommendation: str | None = None


class PerformanceExplanationResponse(BaseModel):
    id: int
    session_id: int
    title: str
    explanation: str
    recommendation: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }