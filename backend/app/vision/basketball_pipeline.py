from app.analyzers.basketball import BasketballAnalyzer
from app.analyzers.basketball_scoring import score_basketball_result
from app.analyzers.basketball_training import analyze_training
from app.vision.basketball_pose_estimator import BasketballPoseEstimator
from app.vision.video_runner import analyze_video

__all__ = ["analyze_basketball"]


def analyze_basketball(video_path: str) -> dict:
    """Analyze a basketball video and return its scored session result."""
    pose_estimator = BasketballPoseEstimator()

    result = analyze_video(
        video_path,
        BasketballAnalyzer(),
        pose_estimator,
    )

    scored = score_basketball_result(result)
    scored["training"] = analyze_training(scored["metrics"])

    return scored
