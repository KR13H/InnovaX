from pathlib import Path

from app.vision.basketball_pipeline import analyze_basketball


VIDEO_PATH = Path(__file__).resolve().parents[2] / "videos" / "basketball.mp4"


def main() -> None:
    result = analyze_basketball(str(VIDEO_PATH))

    assert result["sport"] == "basketball"
    assert 0 <= result["session_score"] <= 100
    assert isinstance(result["metrics"], dict)
    assert isinstance(result["feedback"], list)
    print(result)


if __name__ == "__main__":
    main()
