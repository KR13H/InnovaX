import numpy as np


class BallTracker:
    def __init__(
        self,
        max_missing_frames=3,
        max_distance=100,
    ):
        self.max_missing_frames = max_missing_frames
        self.max_distance = max_distance

        self.last_position = None
        self.velocity = np.array([0.0, 0.0])

        self.missing_frames = 0
        self.trajectory = []

    def update(self, detections, frame_number):

        # No detection
        if not detections:
            return self._handle_missing(frame_number)

        # --------------------------------------------------
        # FIRST DETECTION
        # --------------------------------------------------

        if self.last_position is None:

            best = max(
                detections,
                key=lambda d: d["confidence"],
            )

            position = np.array(
                [best["x"], best["y"]],
                dtype=float,
            )

            self.last_position = position
            self.missing_frames = 0

            point = {
                "frame": frame_number,
                "x": float(position[0]),
                "y": float(position[1]),
                "confidence": best["confidence"],
                "predicted": False,
            }

            self.trajectory.append(point)

            return point

        # --------------------------------------------------
        # PREDICT NEXT POSITION
        # --------------------------------------------------

        predicted_position = (
            self.last_position + self.velocity
        )

        candidates = []

        for detection in detections:

            position = np.array(
                [
                    detection["x"],
                    detection["y"],
                ],
                dtype=float,
            )

            distance = np.linalg.norm(
                position - predicted_position
            )

            # Ignore detections too far away
            if distance > self.max_distance:
                continue

            # Prefer:
            # 1. close to expected trajectory
            # 2. higher confidence

            score = (
                distance
                - detection["confidence"] * 30
            )

            candidates.append(
                (
                    score,
                    detection,
                    position,
                )
            )

        # --------------------------------------------------
        # NO VALID DETECTION
        # --------------------------------------------------

        if not candidates:
            return self._handle_missing(
                frame_number
            )

        # Pick best trajectory-consistent detection
        candidates.sort(
            key=lambda item: item[0]
        )

        _, best, current_position = (
            candidates[0]
        )

        # --------------------------------------------------
        # SMOOTH VELOCITY
        # --------------------------------------------------

        measured_velocity = (
            current_position
            - self.last_position
        )

        self.velocity = (
            0.7 * self.velocity
            + 0.3 * measured_velocity
        )

        self.last_position = (
            current_position
        )

        self.missing_frames = 0

        point = {
            "frame": frame_number,
            "x": float(current_position[0]),
            "y": float(current_position[1]),
            "confidence": best["confidence"],
            "predicted": False,
        }

        self.trajectory.append(point)

        return point

    def _handle_missing(
        self,
        frame_number,
    ):

        self.missing_frames += 1

        if (
            self.last_position is None
            or self.missing_frames
            > self.max_missing_frames
        ):
            return None

        predicted_position = (
            self.last_position
            + self.velocity
        )

        self.last_position = (
            predicted_position
        )

        point = {
            "frame": frame_number,
            "x": float(
                predicted_position[0]
            ),
            "y": float(
                predicted_position[1]
            ),
            "confidence": 0.0,
            "predicted": True,
        }

        self.trajectory.append(point)

        return point

    def get_trajectory(self):
        return self.trajectory