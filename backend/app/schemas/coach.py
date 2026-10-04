from datetime import datetime

from pydantic import BaseModel


class CoachChatRequest(BaseModel):
    message: str


class CoachMessageCreate(BaseModel):
    role: str
    message: str


class CoachMessageResponse(BaseModel):
    id: int
    athlete_id: int
    role: str
    message: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class CoachRecommendationCreate(BaseModel):
    recommendation_type: str
    title: str
    recommendation: str


class CoachRecommendationResponse(BaseModel):
    id: int
    athlete_id: int
    recommendation_type: str
    title: str
    recommendation: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }