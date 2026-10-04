from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.athlete import AthleteProfile
from app.models.training import (
    TrainingPlan,
    Workout,
)
from app.models.user import User
from app.schemas.training import (
    TrainingPlanCreate,
    TrainingPlanResponse,
    WorkoutCreate,
    WorkoutResponse,
    WorkoutUpdate,
)

router = APIRouter(
    prefix="/training",
    tags=["Training"],
)


def get_athlete(
    db: Session,
    current_user: User,
):
    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )

    if not athlete:
        raise HTTPException(
            status_code=404,
            detail="Athlete profile not found",
        )

    return athlete


@router.post(
    "/plan",
    response_model=TrainingPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_training_plan(
    data: TrainingPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    plan = TrainingPlan(
        athlete_id=athlete.id,
        week_start=data.week_start,
        focus=data.focus,
    )

    db.add(plan)
    db.commit()
    db.refresh(plan)

    return plan


@router.get(
    "/plan",
    response_model=list[TrainingPlanResponse],
)
def get_training_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(TrainingPlan)
        .where(
            TrainingPlan.athlete_id == athlete.id
        )
        .order_by(
            TrainingPlan.week_start.desc()
        )
    ).all()


@router.get(
    "/plan/current",
    response_model=TrainingPlanResponse,
)
def get_current_training_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    plan = db.scalar(
        select(TrainingPlan)
        .where(
            TrainingPlan.athlete_id == athlete.id,
            TrainingPlan.status == "active",
        )
        .order_by(
            TrainingPlan.week_start.desc()
        )
        .limit(1)
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="No active training plan found",
        )

    return plan


@router.post(
    "/workouts",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workout(
    data: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    plan = db.scalar(
        select(TrainingPlan).where(
            TrainingPlan.id == data.training_plan_id,
            TrainingPlan.athlete_id == athlete.id,
        )
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Training plan not found",
        )

    workout = Workout(
        **data.model_dump()
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return workout


@router.get(
    "/workouts",
    response_model=list[WorkoutResponse],
)
def get_workouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    return db.scalars(
        select(Workout)
        .join(
            TrainingPlan,
            Workout.training_plan_id == TrainingPlan.id,
        )
        .where(
            TrainingPlan.athlete_id == athlete.id
        )
    ).all()


@router.patch(
    "/workouts/{workout_id}",
    response_model=WorkoutResponse,
)
def update_workout(
    workout_id: int,
    data: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    workout = db.scalar(
        select(Workout)
        .join(
            TrainingPlan,
            Workout.training_plan_id == TrainingPlan.id,
        )
        .where(
            Workout.id == workout_id,
            TrainingPlan.athlete_id == athlete.id,
        )
    )

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found",
        )

    for field, value in data.model_dump(
        exclude_unset=True
    ).items():
        setattr(
            workout,
            field,
            value,
        )

    db.commit()
    db.refresh(workout)

    return workout


@router.post(
    "/workouts/{workout_id}/complete",
    response_model=WorkoutResponse,
)
def complete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = get_athlete(
        db,
        current_user,
    )

    workout = db.scalar(
        select(Workout)
        .join(
            TrainingPlan,
            Workout.training_plan_id == TrainingPlan.id,
        )
        .where(
            Workout.id == workout_id,
            TrainingPlan.athlete_id == athlete.id,
        )
    )

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found",
        )

    workout.status = "completed"

    db.commit()
    db.refresh(workout)

    return workout