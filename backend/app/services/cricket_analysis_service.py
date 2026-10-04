from app.analyzers.cricket_full import FullCricketAnalyzer


# Built on first use: the analyzer loads YOLO weights (weights/cricket_ball_best.pt),
# and loading them at import time would stop the whole API from starting when they're absent.
_cricket_analyzer: FullCricketAnalyzer | None = None


def _get_analyzer() -> FullCricketAnalyzer:
    global _cricket_analyzer
    if _cricket_analyzer is None:
        _cricket_analyzer = FullCricketAnalyzer(
            bowling_arm="right"
        )
    return _cricket_analyzer


class CricketAnalysisService:
    def analyze_video(self, video_path: str):
        return _get_analyzer().analyze(
            video_path
        )
