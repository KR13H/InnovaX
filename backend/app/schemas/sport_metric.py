from pydantic import BaseModel


class SportMetricCreate(BaseModel):
    metric_name: str
    metric_value: float
    unit: str | None = None
    confidence: float | None = None


class SportMetricResponse(BaseModel):
    id: int
    session_id: int
    metric_name: str
    metric_value: float
    unit: str | None
    confidence: float | None

    model_config = {
        "from_attributes": True
    }