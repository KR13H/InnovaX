import json
from pathlib import Path

from app.analyzers.tennis import analyze_tennis
from app.analyzers.running import analyze_running_video
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
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
    
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
VIDEO_MEDIA_TYPES = {".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".avi": "video/x-msvideo", ".mkv": "video/x-matroska"}


@router.get("/{session_id}/video")
def get_session_video(
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
        raise HTTPException(404, "Athlete profile not found")

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )
    if not video_session or not video_session.video_url:
        raise HTTPException(404, "Session has no video")

    # Only serve files from the folders the analyzers read (same rule as analyze-tennis).
    backend_dir = UPLOAD_DIR.parent
    video_path = (backend_dir / video_session.video_url).resolve()
    allowed = [(backend_dir / "uploads").resolve(), (backend_dir / "data").resolve()]
    if not any(video_path.is_relative_to(d) for d in allowed) or not video_path.is_file():
        raise HTTPException(404, "Video file not found")

    return FileResponse(video_path, media_type=VIDEO_MEDIA_TYPES.get(video_path.suffix.lower(), "application/octet-stream"))
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"}


@router.post(
    "/{session_id}/upload",
    response_model=SessionResponse,
)
def upload_session_video(
    session_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )
    if not athlete:
        raise HTTPException(404, "Athlete profile not found")

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )
    if not video_session:
        raise HTTPException(404, "Session not found")

    extension = Path(file.filename or "").suffix.lower() or ".mp4"
    if extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(400, f"Unsupported video type: {extension}")

    # Stored relative to backend/ (e.g. uploads/3/12.mp4), which is what the analyze endpoints expect.
    athlete_dir = UPLOAD_DIR / str(athlete.id)
    athlete_dir.mkdir(parents=True, exist_ok=True)
    destination = athlete_dir / f"{session_id}{extension}"
    with destination.open("wb") as out:
        while chunk := file.file.read(1024 * 1024):
            out.write(chunk)

    video_session.video_url = str(destination.relative_to(UPLOAD_DIR.parent))
    video_session.status = "uploaded"
    db.commit()
    db.refresh(video_session)

    return video_session

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

@router.post("/{session_id}/analyze-running")
def analyze_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # --------------------------------------------------------
    # 1. Find session (scoped to the signed-in athlete)
    # --------------------------------------------------------

    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )
    if not athlete:
        raise HTTPException(404, "Athlete profile not found")

    session = (
        db.query(VideoSession)
        .filter(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
        .first()
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Video session not found",
        )

    # --------------------------------------------------------
    # 2. Make sure session has a video
    # --------------------------------------------------------

    if not session.video_url:
        raise HTTPException(
            status_code=400,
            detail="Session does not have a video",
        )

    # --------------------------------------------------------
    # 3. Resolve video path
    # --------------------------------------------------------

    video_path = Path(session.video_url)

    if not video_path.is_absolute():
        project_root = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        video_path = (
            project_root
            / video_path
        )

    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Video file not found: {video_path}",
        )

    # --------------------------------------------------------
    # 4. Mark session as processing
    # --------------------------------------------------------

    session.status = "processing"

    db.commit()

    try:
        # ----------------------------------------------------
        # 5. Run Running V2
        # ----------------------------------------------------

        result = analyze_running_video(
            video_path
        )

        # ----------------------------------------------------
        # 6. Remove previous automatically generated metrics
        #
        # Useful when /analyze is called again.
        # ----------------------------------------------------

        db.query(SportMetric).filter(
            SportMetric.session_id
            == session.id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------------
        # 7. Save V2 metrics
        # ----------------------------------------------------

        for metric in result["metrics"]:

            db_metric = SportMetric(
                session_id=session.id,

                metric_name=metric[
                    "metric_name"
                ],

                metric_value=metric[
                    "metric_value"
                ],

                unit=metric.get(
                    "unit"
                ),

                confidence=metric.get(
                    "confidence"
                ),
            )

            db.add(db_metric)

        # ----------------------------------------------------
        # 8. Analysis finished
        # ----------------------------------------------------

        session.status = "analyzed"

        db.commit()

        # ----------------------------------------------------
        # 9. Return analyzer result
        # ----------------------------------------------------

        return {
            "session_id": session.id,

            "status": session.status,

            "running_type":
                result["running_type"],

            "classification_confidence":
                result[
                    "classification_confidence"
                ],

            "stride_count":
                result["stride_count"],

            "total_frames":
                result["total_frames"],

            "usable_frames":
                result["usable_frames"],

            "metrics":
                result["metrics"],
        }

    except Exception as exc:

        db.rollback()

        session.status = "failed"

        db.add(session)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Running analysis failed: {exc}",
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

@router.post("/{session_id}/analyze-basketball")
def analyze_basketball_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.vision.basketball_pipeline import analyze_basketball

    athlete = db.scalar(
        select(AthleteProfile).where(
            AthleteProfile.user_id == current_user.id
        )
    )
    if not athlete:
        raise HTTPException(404, "Athlete profile not found")

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )
    if not video_session:
        raise HTTPException(404, "Session not found")
    if not video_session.video_url:
        raise HTTPException(400, "Session has no video path")

    # Same path rules as analyze-tennis.
    backend_dir = Path(__file__).resolve().parents[2]
    video_path = (backend_dir / video_session.video_url).resolve()
    allowed_dirs = [(backend_dir / "data").resolve(), (backend_dir / "uploads").resolve()]
    if not any(video_path.is_relative_to(d) for d in allowed_dirs):
        raise HTTPException(400, "Video must be inside backend/data or backend/uploads")

    if db.scalar(select(SessionAnalysis).where(SessionAnalysis.session_id == session_id)):
        raise HTTPException(409, "Analysis already exists")

    try:
        result = analyze_basketball(str(video_path))
    except FileNotFoundError:
        raise HTTPException(404, "Video or model file not found")
    except ValueError as exc:
        raise HTTPException(422, str(exc))

    analysis = SessionAnalysis(
        session_id=session_id,
        performance_score=result.get("session_score"),
        summary=json.dumps(result),
        analysis_data=result,
        status="completed",
    )
    video_session.status = "completed"
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "session_id": session_id,
        "analysis_id": analysis.id,
        "results": result,
    }


@router.post("/{session_id}/analyze-tennis")
def analyze_tennis_session(
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
        raise HTTPException(404, "Athlete profile not found")

    video_session = db.scalar(
        select(VideoSession).where(
            VideoSession.id == session_id,
            VideoSession.athlete_id == athlete.id,
        )
    )
    if not video_session:
        raise HTTPException(404, "Session not found")

    if not video_session.video_url:
        raise HTTPException(400, "Session has no video path")

    backend_dir = Path(__file__).resolve().parents[2]
    video_path = Path(video_session.video_url).expanduser()
    if not video_path.is_absolute():
        video_path = backend_dir / video_path
    video_path = video_path.resolve()

    allowed_dirs = [
        (backend_dir / "data").resolve(),
        (backend_dir / "uploads").resolve(),
    ]
    if not any(
        video_path.is_relative_to(directory)
        for directory in allowed_dirs
    ):
        raise HTTPException(
            400,
            "Video must be inside backend/data or backend/uploads",
        )

    existing = db.scalar(
        select(SessionAnalysis).where(
            SessionAnalysis.session_id == session_id
        )
    )
    if existing:
        raise HTTPException(409, "Analysis already exists")

    try:
        result = analyze_tennis(video_path)
    except FileNotFoundError:
        raise HTTPException(404, "Video or model file not found")
    except ValueError as exc:
        raise HTTPException(422, str(exc))

    analysis = SessionAnalysis(
        session_id=session_id,
        summary=json.dumps(result),
        status="completed",
    )
    video_session.status = "completed"

    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "session_id": session_id,
        "analysis_id": analysis.id,
        "results": result,
    }
