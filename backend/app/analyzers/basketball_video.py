from pathlib import Path

import cv2
import numpy as np

from app.analyzers.basketball import BasketballAnalyzer
from app.analyzers.basketball_scoring import score_basketball_result
from app.vision.tennis_pose_estimator import PoseEstimator


def analyze_basketball_video(video_path: Path) -> dict:
    """Runs the basketball action model over a clip (~10 sampled frames per second)."""
    analyzer = BasketballAnalyzer()
    capture = cv2.VideoCapture(str(video_path))

    if not capture.isOpened():
        capture.release()
        raise ValueError("Could not open video")

    fps = capture.get(cv2.CAP_PROP_FPS)
    if not np.isfinite(fps) or fps <= 0:
        capture.release()
        raise ValueError("Video has invalid frame rate")

    step = max(1, round(fps / 10))
    frame_results = []
    frame_index = 0
    sampled = 0

    try:
        with PoseEstimator(video=True) as detector:
            while True:
                success, frame = capture.read()
                if not success:
                    break

                if frame_index % step == 0:
                    sampled += 1
                    landmarks = detector.detect(frame, round(frame_index * 1000 / fps))
                    frame_result = analyzer.analyze_frame(landmarks)
                    if frame_result is not None:
                        frame_results.append(frame_result)

                frame_index += 1
    finally:
        capture.release()

    if sampled == 0:
        raise ValueError("Video contains no readable frames")

    result = score_basketball_result(analyzer.analyze_session(frame_results))
    counts = result["metrics"].get("action_counts", {})
    detected = len(frame_results)

    result.update(
        {
            "duration_seconds": round(frame_index / fps, 2),
            "sampled_frames": sampled,
            "pose_detection_percent": round(100 * detected / sampled, 1),
            "action_percentages": {
                action: round(100 * count / detected, 1)
                for action, count in counts.items()
            }
            if detected
            else {},
        }
    )
    return result
