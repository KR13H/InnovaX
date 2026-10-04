import numpy as np
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

        keypoints = np.asarray(keypoints)

        if keypoints.ndim == 3 and keypoints.shape[0] == 1:
            keypoints = keypoints[0]

        return keypoints

    def close(self):
        pass
