from pydantic import BaseModel, Field


class AthleteProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=10, le=100)
    height_cm: float | None = Field(default=None, ge=50, le=250)
    weight_kg: float | None = Field(default=None, ge=20, le=300)
    experience_level: str | None = None


class AthleteProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    age: int | None = Field(default=None, ge=10, le=100)
    height_cm: float | None = Field(default=None, ge=50, le=250)
    weight_kg: float | None = Field(default=None, ge=20, le=300)
    experience_level: str | None = None
    goals: dict[str, list[str]] | None = None


class AthleteProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    age: int | None
    height_cm: float | None
    weight_kg: float | None
    experience_level: str | None
    athlete_score: float | None
    level: int
    xp: int
    goals: dict | list | None = None

    model_config = {
        "from_attributes": True
    }