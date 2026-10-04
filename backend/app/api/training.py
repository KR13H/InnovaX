from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.analysis import SessionAnalysis
from app.models.training import TrainingPlan, Workout
from app.models.session import VideoSession

from app.training.cricket.planner import (
    generate_cricket_training_plan,
)

from app.training.cricket.progress import (
    compare_cricket_sessions,
)

from app.training.tennis.planner import (
    generate_tennis_training_plan,
)

from app.training.tennis.progress import (
    compare_tennis_sessions,
)

from app.training.running.planner import (
    generate_running_training_plan,
)

from app.training.running.progress import (
    compare_running_sessions,
)


router = APIRouter(
    prefix="/training",
    tags=["training"],
)


def get_session_and_analysis(
    session_id: int,
    db: Session,
):
    video_session = (
        db.query(VideoSession)
        .filter(VideoSession.id == session_id)
        .first()
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Video session not found",
        )

    session_analysis = (
        db.query(SessionAnalysis)
        .filter(SessionAnalysis.session_id == session_id)
        .first()
    )

    if not session_analysis:
        raise HTTPException(
            status_code=404,
            detail="Session analysis not found",
        )

    if not session_analysis.analysis_data:
        raise HTTPException(
            status_code=400,
            detail="Session analysis has no analysis_data",
        )

    return video_session, session_analysis


@router.post("/generate/cricket/{session_id}")
def generate_cricket_plan(
    session_id: int,
    db: Session = Depends(get_db),
):
    video_session, session_analysis = (
        get_session_and_analysis(
            session_id,
            db,
        )
    )

    generated_plan = generate_cricket_training_plan(
        analysis=session_analysis.analysis_data,
        athlete_id=video_session.athlete_id,
        days_per_week=4,
    )

    focus_names = [
        focus["label"]
        for focus in generated_plan.get("focus_areas", [])
    ]

    training_plan = TrainingPlan(
        athlete_id=video_session.athlete_id,
        week_start=date.today(),
        focus=", ".join(focus_names),
        status="active",
    )

    db.add(training_plan)
    db.flush()

    for session in generated_plan.get("sessions", []):
        workout = Workout(
            training_plan_id=training_plan.id,
            day_number=session["day"],
            title=session["title"],
            description=f"Training focused on {session['focus']}",
            intensity=session["severity"],
            status="planned",
            priority_score=session["priority_score"],
            source_metric=session["source_metric"],
            current_value=session["current_value"],
            severity=session["severity"],
            warmup=session["warmup"],
            drills=session["drills"],
            cooldown=session["cooldown"],
        )

        db.add(workout)

    db.commit()

    return {
        "plan_id": training_plan.id,
        **generated_plan,
    }


@router.get("/plan/{plan_id}")
def get_training_plan(
    plan_id: int,
    db: Session = Depends(get_db),
):
    plan = (
        db.query(TrainingPlan)
        .filter(TrainingPlan.id == plan_id)
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Training plan not found",
        )

    workouts = (
        db.query(Workout)
        .filter(Workout.training_plan_id == plan_id)
        .order_by(Workout.day_number)
        .all()
    )

    return {
        "plan_id": plan.id,
        "athlete_id": plan.athlete_id,
        "week_start": plan.week_start,
        "focus": plan.focus,
        "status": plan.status,
        "workouts": [
            {
                "id": workout.id,
                "day": workout.day_number,
                "title": workout.title,
                "description": workout.description,
                "intensity": workout.intensity,
                "status": workout.status,
                "priority_score": workout.priority_score,
                "source_metric": workout.source_metric,
                "current_value": workout.current_value,
                "severity": workout.severity,
                "warmup": workout.warmup,
                "drills": workout.drills,
                "cooldown": workout.cooldown,
            }
            for workout in workouts
        ],
    }


@router.post("/workout/{workout_id}/complete")
def complete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = (
        db.query(Workout)
        .filter(Workout.id == workout_id)
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found",
        )

    workout.status = "completed"

    db.commit()
    db.refresh(workout)

    return {
        "workout_id": workout.id,
        "status": workout.status,
        "message": "Workout completed successfully",
    }


@router.get("/compare/cricket/{previous_session_id}/{current_session_id}")
def compare_cricket_progress(
    previous_session_id: int,
    current_session_id: int,
    db: Session = Depends(get_db),
):
    previous = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == previous_session_id
        )
        .first()
    )

    current = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == current_session_id
        )
        .first()
    )

    if not previous or not current:
        raise HTTPException(
            status_code=404,
            detail="One or both session analyses were not found",
        )

    if not previous.analysis_data or not current.analysis_data:
        raise HTTPException(
            status_code=400,
            detail="One or both sessions have no analysis data",
        )

    return compare_cricket_sessions(
        previous.analysis_data,
        current.analysis_data,
    )


@router.post("/generate/tennis/{session_id}")
def generate_tennis_plan(
    session_id: int,
    db: Session = Depends(get_db),
):
    video_session, session_analysis = (
        get_session_and_analysis(
            session_id,
            db,
        )
    )

    generated_plan = generate_tennis_training_plan(
        analysis=session_analysis.analysis_data,
        athlete_id=video_session.athlete_id,
        days_per_week=4,
    )

    focus_names = [
        focus["label"]
        for focus in generated_plan.get(
            "focus_areas",
            [],
        )
    ]

    training_plan = TrainingPlan(
        athlete_id=video_session.athlete_id,
        week_start=date.today(),
        focus=", ".join(focus_names),
        status="active",
    )

    db.add(training_plan)
    db.flush()

    for session in generated_plan.get(
        "sessions",
        [],
    ):
        workout = Workout(
            training_plan_id=training_plan.id,
            day_number=session["day"],
            title=session["title"],
            description=(
                f"Training focused on "
                f"{session['focus']}"
            ),
            intensity=session["severity"],
            status="planned",
            priority_score=session[
                "priority_score"
            ],
            source_metric=session[
                "source_metric"
            ],
            current_value=session[
                "current_value"
            ],
            severity=session[
                "severity"
            ],
            warmup=session[
                "warmup"
            ],
            drills=session[
                "drills"
            ],
            cooldown=session[
                "cooldown"
            ],
        )

        db.add(workout)

    db.commit()

    return {
        "plan_id": training_plan.id,
        **generated_plan,
    }


@router.get(
    "/compare/tennis/"
    "{previous_session_id}/"
    "{current_session_id}"
)
def compare_tennis_progress(
    previous_session_id: int,
    current_session_id: int,
    db: Session = Depends(get_db),
):
    previous = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == previous_session_id
        )
        .first()
    )

    current = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == current_session_id
        )
        .first()
    )

    if not previous or not current:
        raise HTTPException(
            status_code=404,
            detail=(
                "One or both session analyses "
                "were not found"
            ),
        )

    if (
        not previous.analysis_data
        or not current.analysis_data
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "One or both sessions "
                "have no analysis data"
            ),
        )

    return compare_tennis_sessions(
        previous.analysis_data,
        current.analysis_data,
    )


@router.post("/generate/running/{session_id}")
def generate_running_plan(
    session_id: int,
    db: Session = Depends(get_db),
):
    video_session, session_analysis = (
        get_session_and_analysis(
            session_id,
            db,
        )
    )

    generated_plan = (
        generate_running_training_plan(
            analysis=session_analysis.analysis_data,
            athlete_id=video_session.athlete_id,
            days_per_week=4,
        )
    )

    focus_names = [
        focus["label"]
        for focus in generated_plan.get(
            "focus_areas",
            [],
        )
    ]

    training_plan = TrainingPlan(
        athlete_id=video_session.athlete_id,
        week_start=date.today(),
        focus=", ".join(focus_names),
        status="active",
    )

    db.add(training_plan)
    db.flush()

    for session in generated_plan.get(
        "sessions",
        [],
    ):
        workout = Workout(
            training_plan_id=training_plan.id,
            day_number=session["day"],
            title=session["title"],
            description=(
                f"Training focused on "
                f"{session['focus']}"
            ),
            intensity=session["severity"],
            status="planned",
            priority_score=session[
                "priority_score"
            ],
            source_metric=session[
                "source_metric"
            ],
            current_value=session[
                "current_value"
            ],
            severity=session[
                "severity"
            ],
            warmup=session[
                "warmup"
            ],
            drills=session[
                "drills"
            ],
            cooldown=session[
                "cooldown"
            ],
        )

        db.add(workout)

    db.commit()

    return {
        "plan_id": training_plan.id,
        **generated_plan,
    }


@router.get(
    "/compare/running/"
    "{previous_session_id}/"
    "{current_session_id}"
)
def compare_running_progress(
    previous_session_id: int,
    current_session_id: int,
    db: Session = Depends(get_db),
):
    previous = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == previous_session_id
        )
        .first()
    )

    current = (
        db.query(SessionAnalysis)
        .filter(
            SessionAnalysis.session_id
            == current_session_id
        )
        .first()
    )

    if not previous or not current:
        raise HTTPException(
            status_code=404,
            detail=(
                "One or both session analyses "
                "were not found"
            ),
        )

    if (
        not previous.analysis_data
        or not current.analysis_data
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "One or both sessions have "
                "no analysis data"
            ),
        )

    return compare_running_sessions(
        previous.analysis_data,
        current.analysis_data,
    )
@router.get("/athlete/{athlete_id}/current")
def get_current_training_plan(
    athlete_id: int,
    db: Session = Depends(get_db),
):
    plan = (
        db.query(TrainingPlan)
        .filter(
            TrainingPlan.athlete_id == athlete_id,
            TrainingPlan.status == "active",
        )
        .order_by(TrainingPlan.created_at.desc())
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="No active training plan found",
        )

    workouts = (
        db.query(Workout)
        .filter(Workout.training_plan_id == plan.id)
        .order_by(Workout.day_number)
        .all()
    )

    return {
        "plan_id": plan.id,
        "athlete_id": plan.athlete_id,
        "week_start": plan.week_start,
        "focus": plan.focus,
        "status": plan.status,
        "created_at": plan.created_at,
        "workouts": [
            {
                "id": workout.id,
                "day": workout.day_number,
                "title": workout.title,
                "description": workout.description,
                "intensity": workout.intensity,
                "status": workout.status,
                "priority_score": workout.priority_score,
                "source_metric": workout.source_metric,
                "current_value": workout.current_value,
                "severity": workout.severity,
                "warmup": workout.warmup,
                "drills": workout.drills,
                "cooldown": workout.cooldown,
            }
            for workout in workouts
        ],
    }


@router.get("/athlete/{athlete_id}/history")
def get_training_history(
    athlete_id: int,
    db: Session = Depends(get_db),
):
    plans = (
        db.query(TrainingPlan)
        .filter(
            TrainingPlan.athlete_id == athlete_id
        )
        .order_by(
            TrainingPlan.created_at.desc()
        )
        .all()
    )

    return {
        "athlete_id": athlete_id,
        "plans": [
            {
                "plan_id": plan.id,
                "week_start": plan.week_start,
                "focus": plan.focus,
                "status": plan.status,
                "created_at": plan.created_at,
            }
            for plan in plans
        ],
    }


@router.post("/workout/{workout_id}/skip")
def skip_workout(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = (
        db.query(Workout)
        .filter(
            Workout.id == workout_id
        )
        .first()
    )

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found",
        )

    workout.status = "skipped"

    db.commit()
    db.refresh(workout)

    return {
        "workout_id": workout.id,
        "status": workout.status,
        "message": "Workout skipped successfully",
    }