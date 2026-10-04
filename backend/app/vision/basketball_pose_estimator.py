import mediapipe as mp


class BasketballPoseEstimator:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def process_frame(self, frame):
        rgb_frame = frame[:, :,::-1]
        results = self.pose.process(rgb_frame)

        if results.pose_landmarks is None:
            return None

        return results.pose_landmarks.landmark

    def close(self):
        self.pose.close()
