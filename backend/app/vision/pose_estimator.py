from rtmlib import Wholebody
from ultralytics import YOLO


# Two pose backends live here. A merge had folded them into one class, which broke both
# the cricket analyzer (expects rtmlib output) and the running analyzer (expects YOLO output).


class PoseEstimator:
    """RTMLib whole-body pose. process_frame returns (keypoints, scores). Used by cricket."""

    def __init__(self):
        self.model = Wholebody(
            mode="balanced",
            backend="onnxruntime",
            device="cpu",
            to_openpose=False,
        )

    def process_frame(self, frame):
        keypoints, scores = self.model(frame)

        return keypoints, scores


class YoloPoseEstimator:
    """YOLO pose. process_frame returns an Ultralytics result with .keypoints. Used by running."""

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
