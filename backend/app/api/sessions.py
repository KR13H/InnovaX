from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db

from app.models.athlete import AthleteProfile
from app.models.session import VideoSession
from app.models.sport import Sport
from app.models.user import User
from app.models.sport_metric import SportMetric
from app.models.analysis import SessionAnalysis
from app.models.explanation import PerformanceExplanation
from app.models.xp import XPEvent
from app.models.technique_replay import TechniqueReplay
from app.models.reference import SportReferenceRange

from app.schemas.session import (
    SessionCreate,
    SessionResponse,
)

from app.schemas.sport_metric import (
    SportMetricCreate,
    SportMetricResponse,
)

from app.schemas.analysis import (
    SessionAnalysisCreate,
    SessionAnalysisResponse,
)

from app.schemas.explanation import (
    PerformanceExplanationCreate,
    PerformanceExplanationResponse,
)

from app.schemas.recap import SessionRecapResponse

from app.schemas.technique_replay import (
    TechniqueReplayCreate,
    TechniqueReplayResponse,
)

from app.schemas.reference import (
    ReferenceComparisonResponse,
)

from app.services.cricket_analysis_service import (
    CricketAnalysisService,
)
router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
)


@router.post(
    "",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session(
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    sport = db.get(Sport, data.sport_id)

    if not sport:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    session = VideoSession(
        athlete_id=athlete.id,
        sport_id=data.sport_id,
        video_url=data.video_url,
        recorded_at=data.recorded_at,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get(
    "",
    response_model=list[SessionResponse],
)
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    return db.scalars(
        select(VideoSession)
        .where(
            VideoSession.athlete_id == athlete.id
        )
        .order_by(VideoSession.created_at.desc())
    ).all()


@router.get(
    "/{session_id}",
    response_model=SessionResponse,
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return session

@router.post(
    "/{session_id}/metrics",
    response_model=list[SportMetricResponse],
    status_code=status.HTTP_201_CREATED,
)
def add_session_metrics(
    session_id: int,
    metrics: list[SportMetricCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    rows = []

    for metric in metrics:
        row = SportMetric(
            session_id=session.id,
            metric_name=metric.metric_name,
            metric_value=metric.metric_value,
            unit=metric.unit,
            confidence=metric.confidence,
        )

        db.add(row)
        rows.append(row)

    db.commit()

    for row in rows:
        db.refresh(row)

    return rows

@router.get(
    "/{session_id}/metrics",
    response_model=list[SportMetricResponse],
)
def get_session_metrics(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return db.scalars(
        select(SportMetric).where(
            SportMetric.session_id == session.id
        )
    ).all()
    
@router.post("/{session_id}/upload")
def upload_session_video(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Video upload not implemented yet",
    )

@router.post("/{session_id}/analyze")
def analyze_cricket_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------
    # GET ATHLETE
    # --------------------------------------------

    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id
            == current_user.id
        )
    )

    if athlete is None:
        raise HTTPException(
            status_code=404,
            detail="Athlete profile not found",
        )

    # --------------------------------------------
    # GET SESSION
    # --------------------------------------------

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id
            == athlete.id,
        )
    )

    if video_session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    if not video_session.video_url:
        raise HTTPException(
            status_code=400,
            detail="Session has no video",
        )

    # --------------------------------------------
    # CHECK SPORT
    # --------------------------------------------

    sport = db.scalar(
        select(Sport).where(
            Sport.id
            == video_session.sport_id
        )
    )

    if sport is None:
        raise HTTPException(
            status_code=404,
            detail="Sport not found",
        )

    if sport.name.lower() != "cricket":
        raise HTTPException(
            status_code=400,
            detail=(
                "This analyzer currently "
                "supports cricket only"
            ),
        )

    # --------------------------------------------
    # MARK PROCESSING
    # --------------------------------------------

    video_session.status = "processing"

    db.commit()

    # --------------------------------------------
    # RUN CV PIPELINE
    # --------------------------------------------

    try:
        service = CricketAnalysisService()

        result = service.analyze_video(
            video_session.video_url
        )

    except Exception as error:
        video_session.status = "failed"

        db.commit()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Analysis failed: {error}"
            ),
        )

    # --------------------------------------------
    # CHECK PIPELINE RESULT
    # --------------------------------------------

    pose_result = result.get(
        "pose",
        {}
    )

    if (
        pose_result.get("status")
        == "failed"
    ):
        video_session.status = "failed"

        db.commit()

        raise HTTPException(
            status_code=422,
            detail={
                "message":
                    "Pose analysis failed",

                "analysis":
                    result,
            },
        )

    # --------------------------------------------
    # CREATE SUMMARY
    # --------------------------------------------

    phases = pose_result.get(
        "phases",
        {}
    )

    biomechanics = pose_result.get(
        "biomechanics",
        {}
    )

    summary = (
        "Cricket bowling analysis completed. "
        f"BFC frame: "
        f"{phases.get('bfc_frame')}, "
        f"FFC frame: "
        f"{phases.get('ffc_frame')}, "
        f"release frame: "
        f"{phases.get('release_frame')}."
    )

    # --------------------------------------------
    # FIND EXISTING ANALYSIS
    # --------------------------------------------

    analysis_record = db.scalar(
        select(SessionAnalysis).where(
            SessionAnalysis.session_id
            == video_session.id
        )
    )

    # --------------------------------------------
    # UPDATE OR CREATE
    # --------------------------------------------

    if analysis_record is None:
        analysis_record = SessionAnalysis(
            session_id=video_session.id,
            summary=summary,
            analysis_data=result,
            status="completed",
        )

        db.add(
            analysis_record
        )

    else:
        analysis_record.summary = summary
        analysis_record.analysis_data = result
        analysis_record.status = "completed"

    video_session.status = "completed"

    db.commit()
    db.refresh(analysis_record)

    # --------------------------------------------
    # RESPONSE
    # --------------------------------------------

    return {
        "session_id":
            video_session.id,

        "analysis_id":
            analysis_record.id,

        "status":
            "completed",

        "analysis":
            result,
    }

@router.get("/{session_id}/analysis")
def get_session_analysis(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Session analysis not implemented yet",
    )


@router.get("/{session_id}/explanation")
def get_session_explanation(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Performance explanation not implemented yet",
    )


@router.get("/{session_id}/recap")
def get_session_recap(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Session recap not implemented yet",
    )


@router.get(
    "/{session_id}/technique-replay",
    response_model=list[TechniqueReplayResponse],
)
def get_technique_replay(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return db.scalars(
        select(TechniqueReplay).where(
            TechniqueReplay.session_id == session_id
        )
    ).all()

@router.get("/{session_id}/reference-comparison")
def get_reference_comparison(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Reference comparison not implemented yet",
    )


@router.patch("/{session_id}/status")
def update_session_status(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Session status update not implemented yet",
    )


@router.delete("/{session_id}")
def delete_session(session_id: int):
    raise HTTPException(
        status_code=501,
        detail="Session deletion not implemented yet",
    )
    
@router.post(
    "/{session_id}/analysis",
    response_model=SessionAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session_analysis(
    session_id: int,
    data: SessionAnalysisCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    existing = db.scalar(
        select(SessionAnalysis).where(
            SessionAnalysis.session_id == session_id
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Analysis already exists",
        )

    analysis = SessionAnalysis(
        session_id=session_id,
        **data.model_dump(),
    )

    video_session.status = "completed"

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return analysis
@router.get(
    "/{session_id}/analysis",
    response_model=SessionAnalysisResponse,
)
def get_session_analysis(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    analysis = db.scalar(
        select(SessionAnalysis).where(
            SessionAnalysis.session_id == session_id
        )
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found",
        )

    return analysis
@router.post(
    "/{session_id}/explanation",
    response_model=PerformanceExplanationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_session_explanation(
    session_id: int,
    data: PerformanceExplanationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    explanation = PerformanceExplanation(
        session_id=session_id,
        **data.model_dump(),
    )

    db.add(explanation)
    db.commit()
    db.refresh(explanation)

    return explanation

@router.get(
    "/{session_id}/explanation",
    response_model=list[PerformanceExplanationResponse],
)
def get_session_explanation(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return db.scalars(
        select(PerformanceExplanation).where(
            PerformanceExplanation.session_id == session_id
        )
    ).all()
    
@router.get(
    "/{session_id}/recap",
    response_model=SessionRecapResponse,
)
def get_session_recap(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    analysis = db.scalar(
        select(SessionAnalysis).where(
            SessionAnalysis.session_id == session_id
        )
    )

    metrics = db.scalars(
        select(SportMetric).where(
            SportMetric.session_id == session_id
        )
    ).all()

    xp_earned = db.scalar(
        select(
            func.coalesce(
                func.sum(XPEvent.amount),
                0,
            )
        ).where(
            XPEvent.athlete_id == athlete.id,
            XPEvent.reason == f"session:{session_id}",
        )
    )

    return {
        "session_id": session_id,
        "sport_id": video_session.sport_id,
        "analysis": analysis,
        "metrics": metrics,
        "xp_earned": xp_earned,
    }
    
@router.post(
    "/{session_id}/technique-replay",
    response_model=TechniqueReplayResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_technique_replay(
    session_id: int,
    data: TechniqueReplayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    replay = TechniqueReplay(
        session_id=session_id,
        **data.model_dump(),
    )

    db.add(replay)
    db.commit()
    db.refresh(replay)

    return replay
@router.get(
    "/{session_id}/reference-comparison",
    response_model=list[ReferenceComparisonResponse],
)
def get_reference_comparison(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )

    if not video_session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    metrics = db.scalars(
        select(SportMetric).where(
            SportMetric.session_id == session_id
        )
    ).all()

    results = []

    for metric in metrics:
        reference = db.scalar(
            select(SportReferenceRange).where(
                SportReferenceRange.sport_id
                == video_session.sport_id,
                SportReferenceRange.metric_name
                == metric.metric_name,
            )
        )

        if not reference:
            continue

        difference = None

        if (
            reference.min_value is not None
            and metric.metric_value < reference.min_value
        ):
            difference = (
                metric.metric_value
                - reference.min_value
            )

        elif (
            reference.max_value is not None
            and metric.metric_value > reference.max_value
        ):
            difference = (
                metric.metric_value
                - reference.max_value
            )

        else:
            difference = 0

        results.append({
            "metric_name": metric.metric_name,
            "athlete_value": metric.metric_value,
            "reference_min": reference.min_value,
            "reference_max": reference.max_value,
            "unit": reference.unit,
            "difference_from_range": difference,
        })

    return results
