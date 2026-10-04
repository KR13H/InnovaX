import cv2

from app.vision.ball_detector import CricketBallDetector
from app.vision.ball_tracker import BallTracker


VIDEO_PATH = "cv_data/test/ball_test2.mp4"
OUTPUT_PATH = "cv_data/test/output_ball_tracked.mp4"

detector = CricketBallDetector()
tracker = BallTracker()

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video: {VIDEO_PATH}"
    )

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

writer = cv2.VideoWriter(
    OUTPUT_PATH,
    cv2.VideoWriter_fourcc(*"mp4v"),
    fps,
    (width, height),
)

frame_number = 0

while True:
    success, frame = cap.read()

    if not success:
        break

    detections = detector.process_frame(frame)

    tracked_ball = tracker.update(
        detections,
        frame_number,
    )

    if tracked_ball is not None:
        x = int(tracked_ball["x"])
        y = int(tracked_ball["y"])

        if tracked_ball["predicted"]:
            cv2.circle(
                frame,
                (x, y),
                7,
                (0, 255, 255),
                2,
            )

            cv2.putText(
                frame,
                "PREDICTED",
                (x + 10, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 255),
                2,
            )

        else:
            cv2.circle(
                frame,
                (x, y),
                7,
                (0, 0, 255),
                -1,
            )

            cv2.putText(
                frame,
                "BALL",
                (x + 10, y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2,
            )

    trajectory = tracker.get_trajectory()

    # Draw recent trajectory only
    recent = trajectory[-20:]

    for i in range(1, len(recent)):
        p1 = recent[i - 1]
        p2 = recent[i]

        if p2["frame"] - p1["frame"] <= 1:
            cv2.line(
                frame,
                (
                    int(p1["x"]),
                    int(p1["y"]),
                ),
                (
                    int(p2["x"]),
                    int(p2["y"]),
                ),
                (255, 0, 0),
                2,
            )

    writer.write(frame)

    frame_number += 1

    if frame_number % 30 == 0:
        print(
            f"Processed "
            f"{frame_number}/{frame_count}"
        )

cap.release()
writer.release()

trajectory = tracker.get_trajectory()

print()
print("DONE")
print(f"Tracked points: {len(trajectory)}")
print(f"Output: {OUTPUT_PATH}")