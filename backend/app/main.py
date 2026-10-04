from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.athlete import router as athlete_router
from app.api.sports import router as sports_router
from app.api.sessions import router as sessions_router
from app.api.progress import router as progress_router
from app.api.shadow import router as shadow_router
from app.api.recovery import router as recovery_router
from app.api.training import router as training_router
from app.api.coach import router as coach_router
from app.api.achievements import router as achievements_router
from app.api.records import router as records_router
from app.api.movement import router as movement_router
from app.api.risk_signals import router as risk_signals_router
from app.api.sport_transfer import router as sport_transfer_router
from app.api.highlights import router as highlights_router
from app.api.challenges import router as challenges_router
from app.api.coach_dashboard import router as coach_dashboard_router


app = FastAPI(
    title="ShadowAthlete API",
    version="0.1.0",
)


app.include_router(auth_router)
app.include_router(athlete_router)
app.include_router(sports_router)
app.include_router(sessions_router)
app.include_router(progress_router)
app.include_router(shadow_router)
app.include_router(recovery_router)
app.include_router(training_router)
app.include_router(coach_router)
app.include_router(achievements_router)
app.include_router(records_router)
app.include_router(movement_router)
app.include_router(risk_signals_router)
app.include_router(sport_transfer_router)
app.include_router(highlights_router)
app.include_router(challenges_router)
app.include_router(coach_dashboard_router)



@app.get("/")
def root():
    return {
        "name": "ShadowAthlete API",
        "status": "running",
    }