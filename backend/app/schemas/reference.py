from pydantic import BaseModel


class ReferenceRangeResponse(BaseModel):
    id: int
    sport_id: int
    metric_name: str
    level: str
    min_value: float | None
    max_value: float | None
    unit: str | None

    model_config = {
        "from_attributes": True
    }


class ReferenceComparisonResponse(BaseModel):
    metric_name: str
    athlete_value: float
    reference_min: float | None
    reference_max: float | None
    unit: str | None
    difference_from_range: float | None