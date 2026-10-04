from app.analyzers.cricket import CricketAnalyzer

from app.vision.ball_detector import CricketBallDetector
from app.vision.ball_tracker import BallTracker
from app.vision.ball_analysis import BallAnalysis

import cv2


class FullCricketAnalyzer:
    def __init__(
        self,
        bowling_arm="right",
        calibration=None,
    ):
        self.pose_analyzer = CricketAnalyzer(
            bowling_arm=bowling_arm
        )

        self.ball_detector = CricketBallDetector()
        self.calibration = calibration

    def analyze(self, video_path):

        # -----------------------------
        # POSE BRANCH
        # -----------------------------

        pose_result = (
            self.pose_analyzer.analyze_video(
                video_path
            )
        )

        # -----------------------------
        # BALL BRANCH
        # -----------------------------

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise RuntimeError(
                f"Could not open video: {video_path}"
            )

        fps = cap.get(
            cv2.CAP_PROP_FPS
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

        tracker = BallTracker()

        frame_number = 0

        while True:
            success, frame = cap.read()

            if not success:
                break

            detections = (
                self.ball_detector.process_frame(
                    frame
                )
            )

            tracker.update(
                detections,
                frame_number,
            )

            frame_number += 1

        cap.release()

        trajectory = (
            tracker.get_trajectory()
        )

        ball_analyzer = BallAnalysis(
            fps=fps,
            calibration=self.calibration,
        )

        ball_result = ball_analyzer.analyze(
            trajectory=trajectory,
            frame_width=width,
            frame_height=height,
        )

        # -----------------------------
        # FINAL RESULT
        # -----------------------------

        return {
            "pose": pose_result,
            "ball": ball_result,
        }