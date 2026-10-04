from ultralytics import YOLO


class CricketBallDetector:
    def __init__(
        self,
        model_path="weights/cricket_ball_best.pt",
        confidence_threshold=0.25,
    ):
        self.model = YOLO(model_path)
        self.confidence_threshold = confidence_threshold

    def process_frame(self, frame):
        results = self.model(
            frame,
            conf=self.confidence_threshold,
            verbose=False,
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