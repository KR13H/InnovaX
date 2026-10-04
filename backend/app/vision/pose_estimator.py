from ultralytics import YOLO


class PoseEstimator:
    def __init__(self):
        # Pretrained YOLO pose model.
        # Downloads the weights automatically the first time.
        self.model = YOLO("yolo11n-pose.pt")

    def process_frame(self, frame):
        """
        Detect human pose keypoints in one frame.
        """
        results = self.model(
            frame,
            verbose=False,
        )

        return results[0]

    def draw_pose(self, frame, results):
        """
        Draw the detected skeleton and bounding box.
        """
        return results.plot()

    def close(self):
        # Kept so our video-processing interface stays consistent.
        pass