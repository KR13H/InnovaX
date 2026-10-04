import numpy as np


# COCO / WholeBody body points
LEFT_SHOULDER = 5
RIGHT_SHOULDER = 6
LEFT_ELBOW = 7
RIGHT_ELBOW = 8
LEFT_WRIST = 9
RIGHT_WRIST = 10

LEFT_HIP = 11
RIGHT_HIP = 12
LEFT_KNEE = 13
RIGHT_KNEE = 14
LEFT_ANKLE = 15
RIGHT_ANKLE = 16

# WholeBody feet
LEFT_BIG_TOE = 17
LEFT_SMALL_TOE = 18
LEFT_HEEL = 19

RIGHT_BIG_TOE = 20
RIGHT_SMALL_TOE = 21
RIGHT_HEEL = 22


class CricketBiomechanics:

    def __init__(
        self,
        bowling_arm="right",
        confidence_threshold=0.3,
    ):
        self.bowling_arm = bowling_arm
        self.confidence_threshold = confidence_threshold

    # -------------------------------------------------
    # Helpers
    # -------------------------------------------------

    def _point(self, frame, index):
        keypoints = frame["keypoints"]
        scores = frame["scores"]

        if index >= len(keypoints):
            return None

        if scores[index] < self.confidence_threshold:
            return None

        return np.asarray(
            keypoints[index],
            dtype=float,
        )

    def _angle(self, a, b, c):
        """
        Angle ABC in degrees.
        """

        if a is None or b is None or c is None:
            return None

        ba = a - b
        bc = c - b

        denominator = (
            np.linalg.norm(ba)
            * np.linalg.norm(bc)
        )

        if denominator < 1e-8:
            return None

        cosine = np.dot(
            ba,
            bc,
        ) / denominator

        cosine = np.clip(
            cosine,
            -1.0,
            1.0,
        )

        return float(
            np.degrees(
                np.arccos(cosine)
            )
        )

    def _line_angle(self, a, b):
        """
        Angle of line AB relative to horizontal.
        """

        if a is None or b is None:
            return None

        dx = b[0] - a[0]
        dy = b[1] - a[1]

        return float(
            np.degrees(
                np.arctan2(
                    dy,
                    dx,
                )
            )
        )

    def _distance(self, a, b):
        if a is None or b is None:
            return None

        return float(
            np.linalg.norm(a - b)
        )

    def _midpoint(self, a, b):
        if a is None or b is None:
            return None

        return (
            a + b
        ) / 2.0

    def _torso_length(self, frame):
        left_shoulder = self._point(
            frame,
            LEFT_SHOULDER,
        )

        right_shoulder = self._point(
            frame,
            RIGHT_SHOULDER,
        )

        left_hip = self._point(
            frame,
            LEFT_HIP,
        )

        right_hip = self._point(
            frame,
            RIGHT_HIP,
        )

        shoulder_mid = self._midpoint(
            left_shoulder,
            right_shoulder,
        )

        hip_mid = self._midpoint(
            left_hip,
            right_hip,
        )

        return self._distance(
            shoulder_mid,
            hip_mid,
        )

    # -------------------------------------------------
    # BFC
    # -------------------------------------------------

    def _bfc_metrics(self, frame):

        if self.bowling_arm == "right":
            hip = self._point(
                frame,
                RIGHT_HIP,
            )
            knee = self._point(
                frame,
                RIGHT_KNEE,
            )
            ankle = self._point(
                frame,
                RIGHT_ANKLE,
            )
        else:
            hip = self._point(
                frame,
                LEFT_HIP,
            )
            knee = self._point(
                frame,
                LEFT_KNEE,
            )
            ankle = self._point(
                frame,
                LEFT_ANKLE,
            )

        knee_angle = self._angle(
            hip,
            knee,
            ankle,
        )

        return {
            "back_knee_angle_deg":
                self._round(knee_angle),
        }

    # -------------------------------------------------
    # FFC
    # -------------------------------------------------

    def _ffc_metrics(self, frame):

        if self.bowling_arm == "right":

            front_hip = self._point(
                frame,
                LEFT_HIP,
            )

            front_knee = self._point(
                frame,
                LEFT_KNEE,
            )

            front_ankle = self._point(
                frame,
                LEFT_ANKLE,
            )

            back_ankle = self._point(
                frame,
                RIGHT_ANKLE,
            )

            front_heel = self._point(
                frame,
                LEFT_HEEL,
            )

            front_big_toe = self._point(
                frame,
                LEFT_BIG_TOE,
            )

            front_small_toe = self._point(
                frame,
                LEFT_SMALL_TOE,
            )

        else:

            front_hip = self._point(
                frame,
                RIGHT_HIP,
            )

            front_knee = self._point(
                frame,
                RIGHT_KNEE,
            )

            front_ankle = self._point(
                frame,
                RIGHT_ANKLE,
            )

            back_ankle = self._point(
                frame,
                LEFT_ANKLE,
            )

            front_heel = self._point(
                frame,
                RIGHT_HEEL,
            )

            front_big_toe = self._point(
                frame,
                RIGHT_BIG_TOE,
            )

            front_small_toe = self._point(
                frame,
                RIGHT_SMALL_TOE,
            )

        # Knee angle
        front_knee_angle = self._angle(
            front_hip,
            front_knee,
            front_ankle,
        )

        # Delivery stride
        stride_pixels = self._distance(
            front_ankle,
            back_ankle,
        )

        torso_length = self._torso_length(
            frame
        )

        stride_normalized = None

        if (
            stride_pixels is not None
            and torso_length is not None
            and torso_length > 0
        ):
            stride_normalized = (
                stride_pixels
                / torso_length
            )

        # Foot direction
        toe_center = self._midpoint(
            front_big_toe,
            front_small_toe,
        )

        front_foot_angle = (
            self._line_angle(
                front_heel,
                toe_center,
            )
        )

        # Shoulder rotation / hip rotation
        left_shoulder = self._point(
            frame,
            LEFT_SHOULDER,
        )

        right_shoulder = self._point(
            frame,
            RIGHT_SHOULDER,
        )

        left_hip = self._point(
            frame,
            LEFT_HIP,
        )

        right_hip = self._point(
            frame,
            RIGHT_HIP,
        )

        shoulder_angle = self._line_angle(
            left_shoulder,
            right_shoulder,
        )

        hip_angle = self._line_angle(
            left_hip,
            right_hip,
        )

        hip_shoulder_separation = None

        if (
            shoulder_angle is not None
            and hip_angle is not None
        ):
            separation = abs(
                shoulder_angle
                - hip_angle
            )

            # keep in 0-90-ish equivalent
            if separation > 180:
                separation = (
                    360 - separation
                )

            if separation > 90:
                separation = (
                    180 - separation
                )

            hip_shoulder_separation = (
                separation
            )

        return {
            "front_knee_angle_deg":
                self._round(
                    front_knee_angle
                ),

            "delivery_stride_px":
                self._round(
                    stride_pixels
                ),

            "delivery_stride_torso_ratio":
                self._round(
                    stride_normalized
                ),

            "front_foot_angle_deg":
                self._round(
                    front_foot_angle
                ),

            "shoulder_line_angle_deg":
                self._round(
                    shoulder_angle
                ),

            "hip_line_angle_deg":
                self._round(
                    hip_angle
                ),

            "hip_shoulder_separation_deg":
                self._round(
                    hip_shoulder_separation
                ),
        }

    # -------------------------------------------------
    # RELEASE
    # -------------------------------------------------

    def _release_metrics(self, frame):

        if self.bowling_arm == "right":

            shoulder = self._point(
                frame,
                RIGHT_SHOULDER,
            )

            elbow = self._point(
                frame,
                RIGHT_ELBOW,
            )

            wrist = self._point(
                frame,
                RIGHT_WRIST,
            )

        else:

            shoulder = self._point(
                frame,
                LEFT_SHOULDER,
            )

            elbow = self._point(
                frame,
                LEFT_ELBOW,
            )

            wrist = self._point(
                frame,
                LEFT_WRIST,
            )

        elbow_angle = self._angle(
            shoulder,
            elbow,
            wrist,
        )

        arm_extension = self._distance(
            shoulder,
            wrist,
        )

        left_shoulder = self._point(
            frame,
            LEFT_SHOULDER,
        )

        right_shoulder = self._point(
            frame,
            RIGHT_SHOULDER,
        )

        left_hip = self._point(
            frame,
            LEFT_HIP,
        )

        right_hip = self._point(
            frame,
            RIGHT_HIP,
        )

        shoulder_mid = self._midpoint(
            left_shoulder,
            right_shoulder,
        )

        hip_mid = self._midpoint(
            left_hip,
            right_hip,
        )

        torso_lean = None

        if (
            shoulder_mid is not None
            and hip_mid is not None
        ):

            dx = (
                shoulder_mid[0]
                - hip_mid[0]
            )

            dy = (
                hip_mid[1]
                - shoulder_mid[1]
            )

            torso_lean = float(
                np.degrees(
                    np.arctan2(
                        dx,
                        dy,
                    )
                )
            )

        torso_length = self._torso_length(
            frame
        )

        arm_extension_ratio = None

        if (
            arm_extension is not None
            and torso_length is not None
            and torso_length > 0
        ):
            arm_extension_ratio = (
                arm_extension
                / torso_length
            )

        return {
            "bowling_elbow_angle_deg":
                self._round(
                    elbow_angle
                ),

            "torso_lean_deg":
                self._round(
                    torso_lean
                ),

            "arm_extension_px":
                self._round(
                    arm_extension
                ),

            "arm_extension_torso_ratio":
                self._round(
                    arm_extension_ratio
                ),
        }

    # -------------------------------------------------
    # Main
    # -------------------------------------------------

    def calculate(
        self,
        bowler_track,
        phases,
    ):

        bfc_frame_number = phases[
            "bfc_frame"
        ]

        ffc_frame_number = phases[
            "ffc_frame"
        ]

        release_frame_number = phases[
            "release_frame"
        ]

        if bfc_frame_number not in bowler_track.frames:
            raise ValueError(
                "BFC frame missing from bowler track."
            )

        if ffc_frame_number not in bowler_track.frames:
            raise ValueError(
                "FFC frame missing from bowler track."
            )

        if release_frame_number not in bowler_track.frames:
            raise ValueError(
                "Release frame missing from bowler track."
            )

        bfc_frame = bowler_track.frames[
            bfc_frame_number
        ]

        ffc_frame = bowler_track.frames[
            ffc_frame_number
        ]

        release_frame = bowler_track.frames[
            release_frame_number
        ]

        return {
            "bfc": self._bfc_metrics(
                bfc_frame
            ),

            "ffc": self._ffc_metrics(
                ffc_frame
            ),

            "release":
                self._release_metrics(
                    release_frame
                ),
        }

    def _round(
        self,
        value,
        digits=2,
    ):
        if value is None:
            return None

        if np.isnan(value):
            return None

        return round(
            float(value),
            digits,
        )