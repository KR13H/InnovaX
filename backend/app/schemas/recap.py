from pydantic import BaseModel

from app.schemas.analysis import SessionAnalysisResponse
from app.schemas.sport_metric import SportMetricResponse


class SessionRecapResponse(BaseModel):
    session_id: int
    sport_id: int

    analysis: SessionAnalysisResponse | None

    metrics: list[SportMetricResponse]

    xp_earned: int