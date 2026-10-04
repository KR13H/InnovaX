import cv2
import numpy as np

from app.vision.pose_estimator import PoseEstimator
from app.vision.tracker import BowlerTracker
from app.vision.phases import BowlingPhaseDetector
from app.vision.biomechanics import CricketBiomechanics


class CricketAnalyzer:
    def __init__(
        self,
        bowling_arm="right",
    ):
        if bowling_arm not in (
            "right",
            "left",
        ):
            raise ValueError(
                "bowling_arm must be "
                "'right' or 'left'"
            )

        self.pose_estimator = (
            PoseEstimator()
        )

        self.bowling_arm = (
            bowling_arm
        )

    # --------------------------------------------------
    # NORMALIZE RTM OUTPUT
    # --------------------------------------------------

    @staticmethod
    def _normalize_pose_output(
        keypoints,
        scores,
    ):
        if (
            keypoints is None
            or scores is None
        ):
            return None, None

        keypoints = np.asarray(
            keypoints
        )

        scores = np.asarray(
            scores
        )

        if (
            keypoints.size == 0
            or scores.size == 0
        ):
            return None, None

        # Single person
        if keypoints.ndim == 2:
            keypoints = np.expand_dims(
                keypoints,
                axis=0,
            )

        if scores.ndim == 1:
            scores = np.expand_dims(
                scores,
                axis=0,
            )

        if keypoints.ndim != 3:
            return None, None

        if scores.ndim != 2:
            return None, None

        if (
            keypoints.shape[0]
            != scores.shape[0]
        ):
            return None, None

        return keypoints, scores

    # --------------------------------------------------
    # MAIN PIPELINE
    # --------------------------------------------------

    def analyze_video(
        self,
        video_path,
    ):
        cap = cv2.VideoCapture(
            video_path
        )

        if not cap.isOpened():
            raise RuntimeError(
                f"Could not open video: "
                f"{video_path}"
            )

        fps = float(
            cap.get(
                cv2.CAP_PROP_FPS
            )
        )

        frame_count = int(
            cap.get(
                cv2.CAP_PROP_FRAME_COUNT
            )
        )

        width = int(
            cap.get(
                cv2.CAP_PROP_FRAME_WIDTH
            )
        )

        height = int(
            cap.get(
                cv2.CAP_PROP_FRAME_HEIGHT
            )
        )

        if fps <= 0:
            cap.release()

            raise RuntimeError(
                "Invalid video FPS"
            )

        tracker = BowlerTracker()

        frame_number = 0

        frames_with_pose = 0
        total_person_detections = 0

        # ==================================================
        # PASS 1
        # RTMPOSE + PERSON TRACKING
        # ==================================================

        while True:
            success, frame = cap.read()

            if not success:
                break

            try:
                keypoints, scores = (
                    self.pose_estimator
                    .process_frame(
                        frame
                    )
                )

            except Exception as error:
                print(
                    f"[Pose warning] "
                    f"frame "
                    f"{frame_number}: "
                    f"{error}"
                )

                frame_number += 1
                continue

            keypoints, scores = (
                self._normalize_pose_output(
                    keypoints,
                    scores,
                )
            )

            if keypoints is not None:

                frames_with_pose += 1

                total_person_detections += (
                    keypoints.shape[0]
                )

                # IMPORTANT:
                # Call tracker ONCE per frame.
                #
                # BowlerTracker itself loops
                # through all detected people.
                tracker.update(
                    keypoints,
                    scores,
                    frame_number,
                )

            frame_number += 1

            if (
                frame_number % 30
                == 0
            ):
                print(
                    f"Pose processing "
                    f"{frame_number}/"
                    f"{frame_count}"
                )

        cap.release()

        # ==================================================
        # FIND BOWLER
        # ==================================================

        bowler = (
            tracker.get_bowler_track()
        )

        if bowler is None:
            return {
                "status": "failed",

                "reason":
                    "bowler_not_found",

                "video": {
                    "fps": fps,
                    "frames": frame_count,
                    "width": width,
                    "height": height,
                },

                "processing": {
                    "frames_with_pose":
                        frames_with_pose,

                    "person_detections":
                        total_person_detections,

                    "tracks_created":
                        len(
                            tracker.tracks
                        ),
                },
            }

        print()
        print(
            f"Bowler track: "
            f"{bowler.track_id}"
        )

        print(
            f"Frames detected: "
            f"{len(bowler.frames)}"
        )

        print(
            f"Total movement: "
            f"{bowler.total_movement:.2f}"
        )

        # ==================================================
        # PHASE DETECTION
        # ==================================================

        phase_detector = (
            BowlingPhaseDetector(
                bowling_arm=
                    self.bowling_arm
            )
        )

        phases = (
            phase_detector.detect(
                bowler,
                fps,
            )
        )

        if not phases:
            return {
                "status": "failed",

                "reason":
                    "phases_not_found",

                "bowler": {
                    "track_id":
                        bowler.track_id,

                    "frames_detected":
                        len(
                            bowler.frames
                        ),

                    "movement":
                        round(
                            bowler
                            .total_movement,
                            2,
                        ),
                },
            }

        bfc_frame = phases.get("bfc_frame", phases.get("bfc"))
        ffc_frame = phases.get("ffc_frame", phases.get("ffc"))
        release_frame = phases.get("release_frame", phases.get("release"))
        if any(
            frame is None
            for frame in (
                bfc_frame,
                ffc_frame,
                release_frame,
            )
        ):
            return {
                "status": "failed",

                "reason":
                    "incomplete_phase_detection",

                "phases": phases,
            }

        # Basic sanity check

        phase_order_valid = (
            bfc_frame
            <= ffc_frame
            <= release_frame
        )

        # ==================================================
        # BIOMECHANICS
        # ==================================================

        biomechanics_analyzer = (
            CricketBiomechanics(
                bowling_arm=
                    self.bowling_arm
            )
        )

        biomechanics = (
            biomechanics_analyzer.calculate(
                bowler,
                phases,
            )
        )

        # ==================================================
        # TIMING
        # ==================================================

        bfc_to_ffc_ms = round(
            (
                ffc_frame
                - bfc_frame
            )
            / fps
            * 1000,
            2,
        )

        ffc_to_release_ms = round(
            (
                release_frame
                - ffc_frame
            )
            / fps
            * 1000,
            2,
        )

        bfc_to_release_ms = round(
            (
                release_frame
                - bfc_frame
            )
            / fps
            * 1000,
            2,
        )

        # ==================================================
        # FINAL RESULT
        # ==================================================

        return {
            "status": "success",

            "video": {
                "fps":
                    round(fps, 2),

                "frames":
                    frame_count,

                "width":
                    width,

                "height":
                    height,
            },

            "processing": {
                "frames_with_pose":
                    frames_with_pose,

                "person_detections":
                    total_person_detections,

                "tracks_created":
                    len(
                        tracker.tracks
                    ),
            },

            "bowler": {
                "track_id":
                    bowler.track_id,

                "frames_detected":
                    len(
                        bowler.frames
                    ),

                "movement":
                    round(
                        bowler
                        .total_movement,
                        2,
                    ),
            },

            "phases": {
                "bfc_frame":
                    bfc_frame,

                "ffc_frame":
                    ffc_frame,

                "release_frame":
                    release_frame,

                "order_valid":
                    phase_order_valid,
            },

            "timing": {
                "bfc_to_ffc_ms":
                    bfc_to_ffc_ms,

                "ffc_to_release_ms":
                    ffc_to_release_ms,

                "bfc_to_release_ms":
                    bfc_to_release_ms,
            },

            "biomechanics":
                biomechanics,
        }