from app.analyzers.basketball import BasketballAnalyzer
from app.analyzers.basketball_scoring import score_basketball_result
from app.vision.video_runner import analyze_video

__all__ = ["analyze_basketball"]


def analyze_basketball(video_path: str) -> dict:
    """Analyze a basketball video and return its scored session result."""
    result = analyze_video(video_path, BasketballAnalyzer())
    return score_basketball_result(result)
