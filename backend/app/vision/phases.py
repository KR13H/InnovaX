import numpy as np


# -------------------------------
# Main body
# -------------------------------

LEFT_SHOULDER = 5
RIGHT_SHOULDER = 6

LEFT_WRIST = 9
RIGHT_WRIST = 10

LEFT_ANKLE = 15
RIGHT_ANKLE = 16


# -------------------------------
# COCO WholeBody foot landmarks
# -------------------------------

LEFT_BIG_TOE = 17
LEFT_SMALL_TOE = 18
LEFT_HEEL = 19

RIGHT_BIG_TOE = 20
RIGHT_SMALL_TOE = 21
RIGHT_HEEL = 22


class BowlingPhaseDetector:

    def __init__(
        self,
        bowling_arm="right",
        confidence_threshold=0.3,
    ):
        self.bowling_arm = bowling_arm
        self.confidence_threshold = confidence_threshold

    # ----------------------------------------
    # Helpers
    # ----------------------------------------

    def _smooth(self, values, window=3):

        values = np.asarray(
            values,
            dtype=float,
        )

        if len(values) < window:
            return values

        kernel = np.ones(window) / window

        return np.convolve(
            values,
            kernel,
            mode="same",
        )

    def _fill_missing(self, positions):

        positions = positions.copy()

        for axis in range(2):

            values = positions[:, axis]

            valid = ~np.isnan(values)

            if valid.sum() < 2:
                continue

            missing = np.isnan(values)

            values[missing] = np.interp(
                np.flatnonzero(missing),
                np.flatnonzero(valid),
                values[valid],
            )

            positions[:, axis] = values

        return positions

    def _extract_joint(
        self,
        frames,
        joint_index,
    ):

        positions = []

        for frame in frames:

            keypoints = frame["keypoints"]
            scores = frame["scores"]

            if (
                joint_index >= len(scores)
                or scores[joint_index]
                < self.confidence_threshold
            ):
                positions.append(
                    [np.nan, np.nan]
                )

            else:
                positions.append(
                    keypoints[joint_index]
                )

        positions = np.asarray(
            positions,
            dtype=float,
        )

        return self._fill_missing(
            positions
        )

    def _speed_2d(self, positions):

        speed = np.zeros(
            len(positions)
        )

        if len(positions) < 2:
            return speed

        diff = np.diff(
            positions,
            axis=0,
        )

        speed[1:] = np.linalg.norm(
            diff,
            axis=1,
        )

        return speed

    def _normalize(self, values):

        values = np.asarray(
            values,
            dtype=float,
        )

        minimum = np.min(values)
        maximum = np.max(values)

        if maximum - minimum < 1e-8:
            return np.zeros_like(
                values
            )

        return (
            values - minimum
        ) / (
            maximum - minimum
        )

    # ----------------------------------------
    # Build a representative foot point
    # ----------------------------------------

    def _get_foot_center(
        self,
        frames,
        ankle_index,
        big_toe_index,
        small_toe_index,
        heel_index,
    ):

        ankle = self._extract_joint(
            frames,
            ankle_index,
        )

        big_toe = self._extract_joint(
            frames,
            big_toe_index,
        )

        small_toe = self._extract_joint(
            frames,
            small_toe_index,
        )

        heel = self._extract_joint(
            frames,
            heel_index,
        )

        # Average the foot landmarks.
        # Much more stable than ankle alone.

        foot_center = np.mean(
            np.stack(
                [
                    ankle,
                    big_toe,
                    small_toe,
                    heel,
                ]
            ),
            axis=0,
        )

        return {
            "ankle": ankle,
            "big_toe": big_toe,
            "small_toe": small_toe,
            "heel": heel,
            "center": foot_center,
        }

    # ----------------------------------------
    # Release detection
    # ----------------------------------------

    def _detect_release(
        self,
        frames,
    ):

        if self.bowling_arm == "right":

            wrist_index = RIGHT_WRIST
            shoulder_index = RIGHT_SHOULDER

        else:

            wrist_index = LEFT_WRIST
            shoulder_index = LEFT_SHOULDER

        wrist = self._extract_joint(
            frames,
            wrist_index,
        )

        shoulder = self._extract_joint(
            frames,
            shoulder_index,
        )

        wrist_speed = self._smooth(
            self._speed_2d(wrist),
            window=3,
        )

        wrist_height = (
            -wrist[:, 1]
        )

        arm_extension = np.linalg.norm(
            wrist - shoulder,
            axis=1,
        )

        score = (
            0.55
            * self._normalize(
                wrist_speed
            )
            +
            0.25
            * self._normalize(
                wrist_height
            )
            +
            0.20
            * self._normalize(
                arm_extension
            )
        )

        # Ignore early run-up

        start = int(
            len(frames) * 0.60
        )

        end = int(
            len(frames) * 0.95
        )

        relative = np.argmax(
            score[start:end]
        )

        return start + relative

    # ----------------------------------------
    # Foot contact
    # ----------------------------------------

    def _detect_contact(
        self,
        foot,
        start,
        end,
    ):

        center = foot["center"]

        heel = foot["heel"]
        big_toe = foot["big_toe"]
        small_toe = foot["small_toe"]

        center_y = self._smooth(
            center[:, 1],
            window=3,
        )

        heel_y = self._smooth(
            heel[:, 1],
            window=3,
        )

        toe_y = self._smooth(
            (
                big_toe[:, 1]
                +
                small_toe[:, 1]
            ) / 2,
            window=3,
        )

        speed = self._smooth(
            self._speed_2d(
                center
            ),
            window=3,
        )

        segment_center = (
            center_y[start:end]
        )

        segment_heel = (
            heel_y[start:end]
        )

        segment_toe = (
            toe_y[start:end]
        )

        segment_speed = (
            speed[start:end]
        )

        # Foot should be low in image
        # at ground contact.

        low_center = self._normalize(
            segment_center
        )

        low_heel = self._normalize(
            segment_heel
        )

        low_toe = self._normalize(
            segment_toe
        )

        # Foot motion should reduce
        # once planted.

        stability = (
            1
            - self._normalize(
                segment_speed
            )
        )

        contact_score = (

            0.30 * low_center

            + 0.25 * low_heel

            + 0.20 * low_toe

            + 0.25 * stability
        )

        relative = np.argmax(
            contact_score
        )

        return (
            start + relative
        )

    # ----------------------------------------
    # Main
    # ----------------------------------------

    def detect(
        self,
        bowler_track,
        fps,
    ):

        frame_numbers = sorted(
            bowler_track.frames.keys()
        )

        frames = [

            bowler_track.frames[
                frame_number
            ]

            for frame_number
            in frame_numbers
        ]

        if len(frames) < 30:

            raise ValueError(
                "Not enough frames."
            )

        # --------------------------------
        # Build front/back foot
        # --------------------------------

        if self.bowling_arm == "right":

            front_foot = (
                self._get_foot_center(
                    frames,
                    LEFT_ANKLE,
                    LEFT_BIG_TOE,
                    LEFT_SMALL_TOE,
                    LEFT_HEEL,
                )
            )

            back_foot = (
                self._get_foot_center(
                    frames,
                    RIGHT_ANKLE,
                    RIGHT_BIG_TOE,
                    RIGHT_SMALL_TOE,
                    RIGHT_HEEL,
                )
            )

        else:

            front_foot = (
                self._get_foot_center(
                    frames,
                    RIGHT_ANKLE,
                    RIGHT_BIG_TOE,
                    RIGHT_SMALL_TOE,
                    RIGHT_HEEL,
                )
            )

            back_foot = (
                self._get_foot_center(
                    frames,
                    LEFT_ANKLE,
                    LEFT_BIG_TOE,
                    LEFT_SMALL_TOE,
                    LEFT_HEEL,
                )
            )

        # --------------------------------
        # 1. Release
        # --------------------------------

        release_index = (
            self._detect_release(
                frames
            )
        )

        # --------------------------------
        # 2. FFC
        # Search before release
        # --------------------------------

        ffc_start = max(
            0,
            release_index
            - int(0.35 * fps),
        )

        ffc_end = max(
            ffc_start + 1,
            release_index - 1,
        )

        ffc_index = (
            self._detect_contact(
                front_foot,
                ffc_start,
                ffc_end,
            )
        )

        # --------------------------------
        # 3. BFC
        # Search before FFC
        # --------------------------------

        bfc_start = max(
            0,
            ffc_index
            - int(0.40 * fps),
        )

        bfc_end = max(
            bfc_start + 1,
            ffc_index - 1,
        )

        bfc_index = (
            self._detect_contact(
                back_foot,
                bfc_start,
                bfc_end,
            )
        )

        return {

            "bfc_frame":
                frame_numbers[
                    bfc_index
                ],

            "ffc_frame":
                frame_numbers[
                    ffc_index
                ],

            "release_frame":
                frame_numbers[
                    release_index
                ],
        }