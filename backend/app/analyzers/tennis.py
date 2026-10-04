from pathlib import Path


class TennisAnalyzer:
    def analyze(self, video_path: str | Path) -> dict:
        path = Path(video_path).expanduser().resolve()

        if not path.is_file():
            raise FileNotFoundError(f"Video not found: {path}")

        from app.vision.video_processor import analyze_video

        return analyze_video(str(path))


def analyze_tennis(video_path: str | Path) -> dict:
    return TennisAnalyzer().analyze(video_path)