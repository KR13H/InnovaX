from pathlib import Path

import joblib
import numpy as np

from app.analyzers.base import BaseAnalyzer
from app.vision.shot7m2_mapping import map_mediapipe_to_shot7m2
from app.vision.landmark_utils import get_landmark, calculate_angle


class BasketballAnalyzer(BaseAnalyzer):

    def __init__(self):
        # Resolved from this file so it loads regardless of the working directory.
        self.model = joblib.load(
            Path(__file__).resolve().parents[2]
            / "models"
            / "basketball_action_model.pkl"
        )

        self.actions = {
            0: "Idle",
            1: "Move",
            2: "Dribble",
            4: "Shoot",
            6: "Sprint",
        }

    def analyze_frame(self, landmarks):
        if not landmarks:
            return None

        shot_landmarks = map_mediapipe_to_shot7m2(landmarks)

        features = np.array(
            shot_landmarks,
            dtype=np.float32
        ).reshape(1, -1)

        prediction = self.model.predict(features)[0]

        left_knee = calculate_angle(
            get_landmark(landmarks, 23),
            get_landmark(landmarks, 25),
            get_landmark(landmarks, 27),
        )

        right_knee = calculate_angle(
            get_landmark(landmarks, 24),
            get_landmark(landmarks, 26),
            get_landmark(landmarks, 28),
        )

        left_elbow = calculate_angle(
            get_landmark(landmarks, 11),
            get_landmark(landmarks, 13),
            get_landmark(landmarks, 15),
        )

        right_elbow = calculate_angle(
            get_landmark(landmarks, 12),
            get_landmark(landmarks, 14),
            get_landmark(landmarks, 16),
        )

        return {
            "action": self.actions.get(prediction, "Unknown"),
            "left_knee_angle": left_knee,
            "right_knee_angle": right_knee,
            "left_elbow_angle": left_elbow,
            "right_elbow_angle": right_elbow,
        }

    def analyze_session(self, frame_results):
        if not frame_results:
            return self.build_result(
                sport="basketball",
                metrics={}
            )

        actions = [
            result["action"]
            for result in frame_results
        ]

        counts = {}

        for action in actions:
            counts[action] = counts.get(action, 0) + 1

        dominant_action = max(
            counts,
            key=counts.get
        )

        def average(key):
            values = [
                result[key]
                for result in frame_results
                if result.get(key) is not None
            ]
            return round(sum(values) / len(values), 1) if values else None

        return self.build_result(
            sport="basketball",
            metrics={
                "dominant_action": dominant_action,
                "action_counts": counts,
                "avg_left_knee_angle": average("left_knee_angle"),
                "avg_right_knee_angle": average("right_knee_angle"),
                "avg_left_elbow_angle": average("left_elbow_angle"),
                "avg_right_elbow_angle": average("right_elbow_angle"),
            }
        )