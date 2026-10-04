from pydantic import BaseModel


class MovementBaselineCreate(BaseModel):
    sport_id: int | None = None
    metric_name: str
    baseline_value: float
    tolerance: float | None = None
    unit: str | None = None


class MovementBaselineResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int | None
    metric_name: str
    baseline_value: float
    tolerance: float | None
    unit: str | None

    model_config = {
        "from_attributes": True
    }


class MovementCompareRequest(BaseModel):
    metric_name: str
    current_value: float
    sport_id: int | None = None


class MovementCompareResponse(BaseModel):
    metric_name: str
    baseline_value: float
    current_value: float
    difference: float
    tolerance: float | None
    deviation_detected: bool