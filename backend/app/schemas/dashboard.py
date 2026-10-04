from datetime import datetime

from pydantic import BaseModel

from app.schemas.athlete import AthleteProfileResponse
from app.schemas.attribute import AthleteAttributeResponse
from app.schemas.session import SessionResponse
from app.schemas.sport import SportResponse


class DashboardResponse(BaseModel):
    athlete: AthleteProfileResponse

    attributes: list[AthleteAttributeResponse]

    sports: list[SportResponse]

    latest_session: SessionResponse | None = None