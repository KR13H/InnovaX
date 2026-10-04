from pydantic import BaseModel


class SportResponse(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {
        "from_attributes": True
    }


class AthleteSportCreate(BaseModel):
    sport_id: int
    is_primary: bool = False


class AthleteSportResponse(BaseModel):
    id: int
    athlete_id: int
    sport_id: int
    is_primary: bool

    model_config = {
        "from_attributes": True
    }