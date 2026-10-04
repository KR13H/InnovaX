from datetime import datetime

from pydantic import BaseModel, Field


class RecoveryCreate(BaseModel):
    sleep_duration: float | None = Field(
        default=None,
        ge=0,
        le=24,
    )

    sleep_quality: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    resting_hr: float | None = Field(
        default=None,
        ge=20,
        le=250,
    )

    hrv: float | None = Field(
        default=None,
        ge=0,
    )

    fatigue: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    recovery_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )


class RecoveryResponse(RecoveryCreate):
    id: int
    athlete_id: int
    recorded_at: datetime

    model_config = {
        "from_attributes": True
    }