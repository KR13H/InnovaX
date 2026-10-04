import cv2
import mediapipe as mp
from ultralytics import YOLO


class PoseEstimator:
    def __init__(self, mode="mediapipe"):
        self.mode = mode

        if mode == "mediapipe":
            self.mp_pose = mp.solutions.pose
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                enable_segmentation=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )

        elif mode == "yolo":
            self.model = YOLO("yolo11n-pose.pt")

        else:
            raise ValueError(f"Unsupported pose mode: {mode}")

    def process_frame(self, frame):
        if self.mode == "mediapipe":
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_frame)

            if results.pose_landmarks:
                return results.pose_landmarks.landmark

            return None

        results = self.model(
            frame,
            verbose=False,
        )

        return results[0]

    def draw_pose(self, frame, results):
        if self.mode == "yolo":
            return results.plot()

        return frame

    def close(self):
        if self.mode == "mediapipe":
            self.pose.close()
