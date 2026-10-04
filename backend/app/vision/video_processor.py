from pathlib import Path

import cv2
import joblib
import numpy as np

from app.vision.features import extract_features
from app.vision.landmark_utils import landmark_angle
from app.vision.pose_estimator import PoseEstimator


MODEL_PATH = (
    Path(__file__).resolve().parents[2]
    / "ml_models"
    / "tennis_classifier.joblib"
)


def analyze_video(video_path):
    model = joblib.load(MODEL_PATH)
    capture = cv2.VideoCapture(str(video_path))

    if not capture.isOpened():
        capture.release()
        raise ValueError("Could not open video")

    fps = capture.get(cv2.CAP_PROP_FPS)
    if not np.isfinite(fps) or fps <= 0:
        capture.release()
        raise ValueError("Video has invalid frame rate")

    # Analyze approximately 10 frames per second.
    step = max(1, round(fps / 10))
    counts = {str(label): 0 for label in model.classes_}
    counts["unknown"] = 0

    angles = {
        "left_elbow": [],
        "right_elbow": [],
        "left_knee": [],
        "right_knee": [],
    }
    joints = {
        "left_elbow": (11, 13, 15),
        "right_elbow": (12, 14, 16),
        "left_knee": (23, 25, 27),
        "right_knee": (24, 26, 28),
    }

    frame_index = 0
    sampled = 0
    detected = 0

    try:
        with PoseEstimator(video=True) as detector:
            while True:
                success, frame = capture.read()
                if not success:
                    break

                if frame_index % step == 0:
                    sampled += 1
                    timestamp = round(frame_index * 1000 / fps)
                    landmarks = detector.detect(frame, timestamp)
                    values = extract_features(landmarks)
                    label = "unknown"

                    if landmarks is not None:
                        detected += 1
                        height, width = frame.shape[:2]
                        for name, indices in joints.items():
                            angle = landmark_angle(
                                landmarks, indices, width, height
                            )
                            if angle is not None:
                                angles[name].append(angle)

                    if values is not None and np.isfinite(values).all():
                        probabilities = model.predict_proba([values])[0]
                        best = int(np.argmax(probabilities))
                        if probabilities[best] >= 0.6:
                            label = str(model.classes_[best])

                    counts[label] += 1

                frame_index += 1
    finally:
        capture.release()

    if sampled == 0:
        raise ValueError("Video contains no readable frames")

    return {
        "sport": "tennis",
        "duration_seconds": round(frame_index / fps, 2),
        "sampled_frames": sampled,
        "pose_detection_percent": round(100 * detected / sampled, 1),
        "pose_frame_counts": counts,
        "pose_frame_percentages": {
            label: round(100 * count / sampled, 1)
            for label, count in counts.items()
        },
        "mean_joint_angles_degrees": {
            name: round(float(np.mean(values)), 1) if values else None
            for name, values in angles.items()
        },
    }