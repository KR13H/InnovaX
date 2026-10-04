from rtmlib import Wholebody


class PoseEstimator:
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