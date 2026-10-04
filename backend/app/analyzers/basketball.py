import joblib
import numpy as np

from app.analyzers.base import BaseAnalyzer
from app.vision.shot7m2_mapping import map_mediapipe_to_shot7m2


class BasketballAnalyzer(BaseAnalyzer):

    def __init__(self):
        self.model = joblib.load(
            "models/basketball_action_model.pkl"
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

        return {
            "action": self.actions.get(
                prediction,
                "Unknown"
            )
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

        return self.build_result(
            sport="basketball",
            metrics={
                "dominant_action": dominant_action,
                "action_counts": counts,
            }
        )