from datetime import datetime

from pydantic import BaseModel


class AchievementCreate(BaseModel):
    name: str
    description: str | None = None


class AchievementResponse(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = {
        "from_attributes": True
    }


class AchievementUnlock(BaseModel):
    achievement_id: int


class AthleteAchievementResponse(BaseModel):
    id: int
    athlete_id: int
    achievement_id: int
    unlocked_at: datetime

    model_config = {
        "from_attributes": True
    }