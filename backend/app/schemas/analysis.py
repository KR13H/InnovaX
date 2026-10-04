from datetime import datetime

from pydantic import BaseModel, Field


class SessionAnalysisCreate(BaseModel):
    performance_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    summary: str | None = None
    strongest_metric: str | None = None
    weakest_metric: str | None = None


class SessionAnalysisResponse(BaseModel):
    id: int
    session_id: int
    performance_score: float | None
    summary: str | None
    strongest_metric: str | None
    weakest_metric: str | None
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }