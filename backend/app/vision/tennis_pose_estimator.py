from pathlib import Path

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ml_models"
    / "pose_landmarker_full.task"
)


class PoseEstimator:
    def __init__(self, video=False):
        if not MODEL_PATH.is_file():
            raise FileNotFoundError(f"Missing pose model: {MODEL_PATH}")

        self.video = video
        self.last_timestamp = -1

        options = vision.PoseLandmarkerOptions(
            base_options=python.BaseOptions(
                model_asset_path=str(MODEL_PATH)
            ),
            running_mode=(
                vision.RunningMode.VIDEO
                if video
                else vision.RunningMode.IMAGE
            ),
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self.detector = vision.PoseLandmarker.create_from_options(options)

    def detect(self, frame, timestamp_ms=None):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        if self.video:
            if timestamp_ms is None:
                raise ValueError("Video frames require a timestamp.")

            timestamp_ms = int(timestamp_ms)
            if timestamp_ms <= self.last_timestamp:
                raise ValueError("Timestamps must increase.")

            result = self.detector.detect_for_video(image, timestamp_ms)
            self.last_timestamp = timestamp_ms
        else:
            result = self.detector.detect(image)

        return result.pose_landmarks[0] if result.pose_landmarks else None

    def close(self):
        self.detector.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.close()