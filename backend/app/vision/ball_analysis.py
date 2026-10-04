import math
import numpy as np


class BallAnalysis:
    def __init__(
        self,
        fps,
        calibration=None,
    ):
        self.fps = fps
        self.calibration = calibration

    # --------------------------------------------------
    # CLEAN TRAJECTORY
    # --------------------------------------------------

    def clean_trajectory(self, trajectory):
        if not trajectory:
            return []

        cleaned = []

        for point in trajectory:
            if not cleaned:
                cleaned.append(point)
                continue

            previous = cleaned[-1]

            dx = point["x"] - previous["x"]
            dy = point["y"] - previous["y"]

            distance = math.sqrt(
                dx * dx + dy * dy
            )

            # Ignore ridiculous jumps
            if distance < 250:
                cleaned.append(point)

        return cleaned

    # --------------------------------------------------
    # RELEASE POINT
    # --------------------------------------------------

    def detect_release(self, trajectory):
        """
        First meaningful point of the delivery trajectory.

        For now we use the beginning of sustained
        high-speed motion rather than simply frame 0.
        """

        if len(trajectory) < 4:
            return None

        speeds = []

        for i in range(1, len(trajectory)):
            p1 = trajectory[i - 1]
            p2 = trajectory[i]

            dx = p2["x"] - p1["x"]
            dy = p2["y"] - p1["y"]

            speed = math.sqrt(
                dx * dx + dy * dy
            )

            speeds.append(speed)

        if not speeds:
            return trajectory[0]

        median_speed = np.median(speeds)

        threshold = max(
            median_speed * 0.5,
            3,
        )

        for i in range(len(speeds) - 2):
            if (
                speeds[i] > threshold
                and speeds[i + 1] > threshold
            ):
                return trajectory[i]

        return trajectory[0]

    # --------------------------------------------------
    # BOUNCE POINT
    # --------------------------------------------------

    def detect_bounce(self, trajectory):
        """
        Detect a directional change in the trajectory.

        In broadcast cricket footage the ball generally
        moves downward toward the pitch, reaches its
        lowest visual point, then changes direction.
        """

        if len(trajectory) < 7:
            return None

        best_index = None
        best_score = 0

        for i in range(2, len(trajectory) - 2):
            before = trajectory[i - 2]
            current = trajectory[i]
            after = trajectory[i + 2]

            velocity_before_y = (
                current["y"] - before["y"]
            )

            velocity_after_y = (
                after["y"] - current["y"]
            )

            # A bounce often produces a change in
            # vertical direction/slope
            direction_change = abs(
                velocity_after_y
                - velocity_before_y
            )

            if direction_change > best_score:
                best_score = direction_change
                best_index = i

        if best_index is None:
            return None

        return trajectory[best_index]

    # --------------------------------------------------
    # DELIVERY TRAJECTORY
    # --------------------------------------------------

    def get_delivery_trajectory(
        self,
        trajectory,
        release,
        bounce,
    ):
        if not trajectory or release is None:
            return []

        start_frame = release["frame"]

        delivery = [
            p
            for p in trajectory
            if p["frame"] >= start_frame
        ]

        return delivery

    # --------------------------------------------------
    # LINE
    # --------------------------------------------------

    def estimate_line(
        self,
        bounce,
        frame_width=None,
    ):
        if bounce is None:
            return "unknown"

        # Best version: calibrated world coordinates
        if self.calibration is not None:
            world = self.calibration.pixel_to_world(
                bounce["x"],
                bounce["y"],
            )

            if world is not None:
                x, _ = world

                pitch_center = 3.05 / 2

                offset = x - pitch_center

                if offset < -0.45:
                    return "outside_off"

                if offset < -0.15:
                    return "off_stump"

                if offset <= 0.15:
                    return "middle_stump"

                if offset <= 0.45:
                    return "leg_stump"

                return "outside_leg"

        # Fallback: image-relative estimate
        if frame_width is None:
            return "unknown"

        normalized_x = (
            bounce["x"] / frame_width
        )

        if normalized_x < 0.40:
            return "left_channel"

        if normalized_x < 0.47:
            return "left_of_center"

        if normalized_x <= 0.53:
            return "center"

        if normalized_x <= 0.60:
            return "right_of_center"

        return "right_channel"

    # --------------------------------------------------
    # LENGTH
    # --------------------------------------------------

    def estimate_length(
        self,
        bounce,
        frame_height=None,
    ):
        if bounce is None:
            return "unknown"

        # Proper calibrated result
        if self.calibration is not None:
            world = self.calibration.pixel_to_world(
                bounce["x"],
                bounce["y"],
            )

            if world is not None:
                _, distance_from_bowler = world

                pitch_length = 20.12

                distance_to_batter = (
                    pitch_length
                    - distance_from_bowler
                )

                if distance_to_batter < 2.0:
                    return "yorker"

                if distance_to_batter < 4.0:
                    return "full"

                if distance_to_batter < 7.0:
                    return "good_length"

                if distance_to_batter < 10.0:
                    return "short"

                return "very_short"

        # Pixel fallback
        if frame_height is None:
            return "unknown"

        normalized_y = (
            bounce["y"] / frame_height
        )

        if normalized_y > 0.80:
            return "very_full"

        if normalized_y > 0.68:
            return "full"

        if normalized_y > 0.55:
            return "good_length"

        if normalized_y > 0.42:
            return "short"

        return "very_short"

    # --------------------------------------------------
    # SPEED
    # --------------------------------------------------

    def estimate_speed(
        self,
        trajectory,
        release,
        bounce,
    ):
        """
        Only returns physical speed when calibration
        exists.

        Otherwise returns None.
        """

        if (
            self.calibration is None
            or release is None
            or bounce is None
        ):
            return None

        release_world = (
            self.calibration.pixel_to_world(
                release["x"],
                release["y"],
            )
        )

        bounce_world = (
            self.calibration.pixel_to_world(
                bounce["x"],
                bounce["y"],
            )
        )

        if (
            release_world is None
            or bounce_world is None
        ):
            return None

        dx = (
            bounce_world[0]
            - release_world[0]
        )

        dy = (
            bounce_world[1]
            - release_world[1]
        )

        distance_m = math.sqrt(
            dx * dx + dy * dy
        )

        frame_difference = (
            bounce["frame"]
            - release["frame"]
        )

        if frame_difference <= 0:
            return None

        time_seconds = (
            frame_difference / self.fps
        )

        speed_mps = (
            distance_m / time_seconds
        )

        speed_kmh = (
            speed_mps * 3.6
        )

        return round(speed_kmh, 2)

    # --------------------------------------------------
    # COMPLETE ANALYSIS
    # --------------------------------------------------

    def analyze(
        self,
        trajectory,
        frame_width,
        frame_height,
    ):
        trajectory = self.clean_trajectory(
            trajectory
        )

        release = self.detect_release(
            trajectory
        )

        bounce = self.detect_bounce(
            trajectory
        )

        delivery_trajectory = (
            self.get_delivery_trajectory(
                trajectory,
                release,
                bounce,
            )
        )

        line = self.estimate_line(
            bounce,
            frame_width,
        )

        length = self.estimate_length(
            bounce,
            frame_height,
        )

        speed = self.estimate_speed(
            trajectory,
            release,
            bounce,
        )

        return {
            "release": release,
            "bounce": bounce,
            "line": line,
            "length": length,
            "speed_kmh": speed,
            "trajectory": delivery_trajectory,
        }