from pathlib import Path

import torch
from ultralytics import YOLO

# Apple-GPU (Metal) inference is ~3-4x faster than CPU here with identical detections.
DEVICE = "mps" if torch.backends.mps.is_available() else ("cuda" if torch.cuda.is_available() else "cpu")
DEFAULT_MODEL = Path(__file__).resolve().parents[2] / "weights" / "cricket_ball_best.pt"


class CricketBallDetector:
    def __init__(
        self,
        model_path=DEFAULT_MODEL,
        confidence_threshold=0.25,
    ):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold

    def process_frame(self, frame):
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            verbose=False,
            device=DEVICE,
        )

        detections = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])

                detections.append({
                    "x": (x1 + x2) / 2,
                    "y": (y1 + y2) / 2,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2],
                })

        return detections