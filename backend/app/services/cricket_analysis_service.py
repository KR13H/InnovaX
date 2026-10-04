from app.analyzers.cricket_full import FullCricketAnalyzer


_cricket_analyzer = FullCricketAnalyzer(
    bowling_arm="right"
)


class CricketAnalysisService:
    def analyze_video(self, video_path: str):
        return _cricket_analyzer.analyze(
            video_path
        )