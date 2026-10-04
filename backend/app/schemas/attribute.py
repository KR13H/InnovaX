from pydantic import BaseModel


class AthleteAttributeUpdate(BaseModel):
    attribute_type: str
    current_score: float
    peak_score: float
    target_score: float | None = None


class AthleteAttributeResponse(BaseModel):
    id: int
    athlete_id: int
    attribute_type: str
    current_score: float
    peak_score: float
    target_score: float | None

    model_config = {
        "from_attributes": True
    }