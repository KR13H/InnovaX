from datetime import date

from pydantic import BaseModel


class TrainingPlanCreate(BaseModel):
    week_start: date
    focus: str | None = None


class TrainingPlanResponse(BaseModel):
    id: int
    athlete_id: int
    week_start: date
    focus: str | None
    status: str

    model_config = {
        "from_attributes": True
    }


class WorkoutCreate(BaseModel):
    training_plan_id: int
    day_number: int
    title: str
    description: str | None = None
    intensity: str | None = None


class WorkoutUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    intensity: str | None = None
    status: str | None = None


class WorkoutResponse(BaseModel):
    id: int
    training_plan_id: int
    day_number: int
    title: str
    description: str | None
    intensity: str | None
    status: str

    model_config = {
        "from_attributes": True
    }