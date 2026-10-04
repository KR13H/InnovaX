import cv2
import joblib
import numpy as np

from app.vision.features import extract_features
from app.vision.pose_estimator import PoseEstimator


model = joblib.load("ml_models/tennis_classifier.joblib")
capture = cv2.VideoCapture("data/tennis/test.mp4")

# Lines connecting the body joints.
connections = [
    (11, 12), (11, 13), (13, 15),
    (12, 14), (14, 16), (11, 23),
    (12, 24), (23, 24), (23, 25),
    (25, 27), (24, 26), (26, 28),
]

try:
    with PoseEstimator() as detector:
        while True:
            success, frame = capture.read()
            if not success:
                break

            landmarks = detector.detect(frame)
            values = extract_features(landmarks)
            text = "No pose detected"

            if landmarks is not None:
                height, width = frame.shape[:2]

                for a, b in connections:
                    if min(
                        landmarks[a].visibility,
                        landmarks[b].visibility,
                    ) < 0.6:
                        continue

                    start = (
                        int(landmarks[a].x * width),
                        int(landmarks[a].y * height),
                    )
                    end = (
                        int(landmarks[b].x * width),
                        int(landmarks[b].y * height),
                    )
                    cv2.line(frame, start, end, (0, 255, 0), 3)

                text = "Pose detected; features unavailable"

            if values is not None and np.isfinite(values).all():
                probabilities = model.predict_proba([values])[0]
                best = int(np.argmax(probabilities))
                confidence = float(probabilities[best])
                label = str(model.classes_[best])
                text = f"{label}: {confidence:.0%}"
                if confidence < 0.6:
                    text = "Unknown | best guess: " + text

            cv2.putText(
                frame, text, (15, 35),
                cv2.FONT_HERSHEY_SIMPLEX, 0.65,
                (0, 255, 255), 2,
            )

            scale = min(1.0, 800 / frame.shape[0])
            display = cv2.resize(
                frame, None, fx=scale, fy=scale
            )
            cv2.imshow("Tennis preview - Q to close", display)

            if cv2.waitKey(30) & 0xFF == ord("q"):
                break
finally:
    capture.release()
    cv2.destroyAllWindows()