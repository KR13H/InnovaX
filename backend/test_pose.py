import cv2
import numpy as np

from rtmlib import draw_skeleton

from app.vision.pose_estimator import PoseEstimator
from app.vision.tracker import BowlerTracker
from app.vision.phases import BowlingPhaseDetector
from app.vision.biomechanics import CricketBiomechanics


VIDEO_PATH = "cv_data/test/bowling.mp4"
OUTPUT_PATH = "cv_data/test/output_bowler_phases.mp4"


pose_estimator = PoseEstimator()
tracker = BowlerTracker()

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    raise RuntimeError(f"Could not open video: {VIDEO_PATH}")

fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

print("FPS:", fps)
print("Frames:", frame_count)
print("Resolution:", width, "x", height)

# -----------------------------
# PASS 1: Detect and track people
# -----------------------------

frame_number = 0

while True:
    success, frame = cap.read()

    if not success:
        break

    keypoints, scores = pose_estimator.process_frame(frame)
    if frame_number == 0:
        print(
            "Keypoints detected:",
            keypoints.shape
    )

    tracker.update(
        keypoints,
        scores,
        frame_number,
    )

    frame_number += 1

    if frame_number % 30 == 0:
        print(f"Tracking: {frame_number}/{frame_count}")

cap.release()

# -----------------------------
# Identify bowler
# -----------------------------

bowler = tracker.get_bowler_track()

if bowler is None:
    raise RuntimeError("Could not identify bowler.")

print()
print("Bowler track:", bowler.track_id)
print("Frames detected:", len(bowler.frames))
print("Total movement:", round(bowler.total_movement, 2))

# -----------------------------
# Detect bowling phases
# -----------------------------

phase_detector = BowlingPhaseDetector(
    bowling_arm="right"
)

phases = phase_detector.detect(
    bowler,
    fps,
)
biomechanics = CricketBiomechanics(
    bowling_arm="right"
)

metrics = biomechanics.calculate(
    bowler,
    phases,
)

print()
print("BIOMECHANICS")
print("----------------")

for phase, values in metrics.items():
    print()
    print(phase.upper())

    for name, value in values.items():
        print(f"{name}: {value}")

print()
print("BOWLING PHASES")
print("----------------")
print("BFC:", phases["bfc_frame"])
print("FFC:", phases["ffc_frame"])
print("Release:", phases["release_frame"])

# -----------------------------
# PASS 2: Draw bowler + phases
# -----------------------------

cap = cv2.VideoCapture(VIDEO_PATH)

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

    # Draw bowler skeleton only
    if frame_number in bowler.frames:
        data = bowler.frames[frame_number]

        keypoints = np.expand_dims(
            data["keypoints"],
            axis=0,
        )

        scores = np.expand_dims(
            data["scores"],
            axis=0,
        )

        frame = draw_skeleton(
            frame,
            keypoints,
            scores,
            kpt_thr=0.3,
        )

    # Draw phase labels
    if frame_number == phases["bfc_frame"]:
        cv2.putText(
            frame,
            "BFC",
            (50, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            2,
            (0, 255, 255),
            4,
        )

    elif frame_number == phases["ffc_frame"]:
        cv2.putText(
            frame,
            "FFC",
            (50, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            2,
            (0, 255, 255),
            4,
        )

    elif frame_number == phases["release_frame"]:
        cv2.putText(
            frame,
            "RELEASE",
            (50, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            2,
            (0, 255, 255),
            4,
        )

    writer.write(frame)

    frame_number += 1

cap.release()
writer.release()

print()
print("DONE")
print(f"Output saved to: {OUTPUT_PATH}")