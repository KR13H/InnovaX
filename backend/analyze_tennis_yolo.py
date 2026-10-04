import json
from pathlib import Path
from types import SimpleNamespace

import cv2
import joblib
import numpy as np
from ultralytics import YOLO

from app.vision.features import extract_features
from app.vision.landmark_utils import landmark_angle
from app.vision.pose_estimator import PoseEstimator


ROOT = Path(__file__).resolve().parent
VIDEO_PATH = ROOT / "data" / "tennis" / "test.mp4"
CLASSIFIER_PATH = ROOT / "ml_models" / "tennis_classifier.joblib"
OUTPUT_PATH = ROOT / "tennis_yolo_stats.json"
TIMELINE_PATH = ROOT / "tennis_timeline.json"

TARGET_ID = 1
CONFIDENCE_THRESHOLD = 0.6

JOINTS = {
    "left_elbow": (11, 13, 15),
    "right_elbow": (12, 14, 16),
    "left_knee": (23, 25, 27),
    "right_knee": (24, 26, 28),
}

CONNECTIONS = [
    (11, 12),
    (11, 13), (13, 15),
    (12, 14), (14, 16),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27),
    (24, 26), (26, 28),
]

def estimate_shots(timeline, fps):
    """Group action frames; this estimates swings, not ball contacts."""
    stroke_labels = {"backhand", "forehand", "serve"}
    max_gap_seconds = 0.15
    min_support_seconds = 0.20

    events = []
    active = None

    def finish():
        nonlocal active
        if active is None:
            return

        support_seconds = active["support_frames"] / fps

        if support_seconds >= min_support_seconds:
            events.append({
                "type": active["type"],
                "start_seconds": active["start_seconds"],
                "end_seconds": active["end_seconds"],
                "support_frames": active["support_frames"],
                "touches_clip_start": active["start_frame"] == 0,
                "touches_clip_end": (
                    active["end_frame"] == timeline[-1]["frame"]
                ),
            })

        active = None

    for row in timeline:
        label = row["label"]
        time = row["time_seconds"]

        if active is not None:
            gap = time - active["end_seconds"]

            if (
                not row["player_tracked"]
                or label == "ready_position"
                or gap > max_gap_seconds
                or (
                    label in stroke_labels
                    and label != active["type"]
                )
            ):
                finish()

        if (
            row["player_tracked"]
            and row["pose_detected"]
            and label in stroke_labels
        ):
            if active is None:
                active = {
                    "type": label,
                    "start_seconds": time,
                    "end_seconds": time,
                    "start_frame": row["frame"],
                    "end_frame": row["frame"],
                    "support_frames": 1,
                }
            else:
                active["end_seconds"] = time
                active["end_frame"] = row["frame"]
                active["support_frames"] += 1

    finish()

    counts = {
        label: sum(event["type"] == label for event in events)
        for label in sorted(stroke_labels)
    }

    return counts, events
def main():
    if not VIDEO_PATH.is_file():
        raise FileNotFoundError(f"Missing video: {VIDEO_PATH}")

    if not CLASSIFIER_PATH.is_file():
        raise FileNotFoundError(
            f"Missing classifier: {CLASSIFIER_PATH}. "
            "Run python train_tennis.py first."
        )

    capture = cv2.VideoCapture(str(VIDEO_PATH))
    try:
        if not capture.isOpened():
            raise RuntimeError(f"Cannot open video: {VIDEO_PATH}")

        fps = capture.get(cv2.CAP_PROP_FPS)
    finally:
        capture.release()

    if not np.isfinite(fps) or fps <= 0:
        raise RuntimeError("Cannot read valid video FPS")

    yolo = YOLO(str(ROOT / "yolov8n.pt"))
    classifier = joblib.load(CLASSIFIER_PATH)

    counts = {str(label): 0 for label in classifier.classes_}
    counts["unknown"] = 0

    angles = {name: [] for name in JOINTS}
    timeline = []

    processed = 0
    tracked = 0
    poses = 0
    stopped_early = False

    results = yolo.track(
        source=str(VIDEO_PATH),
        tracker="bytetrack.yaml",
        classes=[0],
        stream=True,
        verbose=False,
        vid_stride=1,
    )

    try:
        with PoseEstimator() as detector:
            for result in results:
                processed += 1

                # Keep pose detection input free of drawn overlays.
                frame = result.orig_img.copy()
                height, width = frame.shape[:2]

                text = f"Player {TARGET_ID} | not tracked"
                label = "not_tracked"
                guess = None
                confidence = None
                pose_found = False
                player_found = False
                probabilities_by_class = None
                visible_track_ids = []

                boxes = result.boxes

                if boxes is not None and boxes.id is not None:
                    ids = boxes.id.cpu().numpy().astype(int)
                    visible_track_ids = [int(value) for value in ids]
                    matches = np.flatnonzero(ids == TARGET_ID)

                    if len(matches):
                        player_found = True
                        tracked += 1

                        box = boxes.xyxy[
                            int(matches[0])
                        ].cpu().numpy()

                        x1, y1, x2, y2 = box
                        padding = 0.25 * max(x2 - x1, y2 - y1)

                        x1 = max(0, int(x1 - padding))
                        y1 = max(0, int(y1 - padding))
                        x2 = min(width, int(x2 + padding))
                        y2 = min(height, int(y2 + padding))

                        crop = frame[y1:y2, x1:x2]
                        landmarks = (
                            detector.detect(crop)
                            if crop.size else None
                        )

                        label = "unknown"
                        text = f"Player {TARGET_ID} | no pose"

                        if landmarks is not None:
                            poses += 1
                            pose_found = True

                            # Map crop landmarks into full-frame
                            # normalized coordinates.
                            mapped = [
                                SimpleNamespace(
                                    x=(
                                        x1 + p.x * (x2 - x1)
                                    ) / width,
                                    y=(
                                        y1 + p.y * (y2 - y1)
                                    ) / height,
                                    visibility=p.visibility or 0.0,
                                )
                                for p in landmarks
                            ]

                            values = extract_features(
                                mapped, width, height
                            )
                            text = f"Player {TARGET_ID} | unknown"

                            if (
                                values is not None
                                and np.isfinite(values).all()
                            ):
                                probabilities = (
                                    classifier.predict_proba(
                                        [values]
                                    )[0]
                                )

                                probabilities_by_class = {
                                    str(class_name): round(
                                        float(probability), 4
                                    )
                                    for class_name, probability in zip(
                                        classifier.classes_,
                                        probabilities,
                                    )
                                }

                                best = int(np.argmax(probabilities))
                                guess = str(
                                    classifier.classes_[best]
                                )
                                confidence = float(
                                    probabilities[best]
                                )

                                if confidence >= CONFIDENCE_THRESHOLD:
                                    label = guess

                                text = (
                                    f"Player {TARGET_ID} | {label} | "
                                    f"guess {guess} {confidence:.0%}"
                                )

                            for name, indices in JOINTS.items():
                                angle = landmark_angle(
                                    mapped, indices, width, height
                                )

                                if (
                                    angle is not None
                                    and np.isfinite(angle)
                                ):
                                    angles[name].append(angle)

                            for a, b in CONNECTIONS:
                                if min(
                                    mapped[a].visibility,
                                    mapped[b].visibility,
                                ) < 0.6:
                                    continue

                                start = (
                                    int(mapped[a].x * width),
                                    int(mapped[a].y * height),
                                )
                                end = (
                                    int(mapped[b].x * width),
                                    int(mapped[b].y * height),
                                )

                                cv2.line(
                                    frame, start, end,
                                    (0, 255, 0), 2,
                                )

                        # Counts classify tracked frames, not shots.
                        counts[label] += 1

                        cv2.rectangle(
                            frame,
                            (x1, y1),
                            (x2, y2),
                            (255, 0, 0),
                            2,
                        )

                timeline.append({
                    "frame": processed - 1,
                    "time_seconds": round(
                        (processed - 1) / fps, 3
                    ),
                    "player_tracked": player_found,
                    "visible_track_ids": visible_track_ids,
                    "pose_detected": pose_found,
                    "label": label,
                    "guess": guess,
                    "confidence": (
                        round(confidence, 4)
                        if confidence is not None else None
                    ),
                    "class_probabilities": probabilities_by_class,
                })

                scale = min(1.0, 800 / height)
                display = cv2.resize(
                    frame, None, fx=scale, fy=scale
                )

                cv2.putText(
                    display,
                    text,
                    (10, 25),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    (0, 255, 255),
                    1,
                )

                cv2.imshow(
                    "Selected athlete - Q to stop",
                    display,
                )

                if cv2.waitKey(1) & 0xFF == ord("q"):
                    stopped_early = True
                    break

    finally:
        results.close()
        cv2.destroyAllWindows()
    estimated_counts, shot_events = estimate_shots(timeline, fps)
    stats = {
        "sport": "tennis",
        "estimated_shot_counts": estimated_counts,
        "estimated_shot_events": shot_events,
        "target_track_id": TARGET_ID,
        "stopped_early": stopped_early,
        "fps": round(float(fps), 3),
        "processed_frames": processed,
        "tracked_player_frames": tracked,
        "pose_detected_frames": poses,
        "tracking_coverage_percent": (
            round(100 * tracked / processed, 1)
            if processed else 0.0
        ),
        "pose_frame_counts": counts,
        "mean_joint_angles_degrees": {
            name: (
                round(float(np.mean(values)), 1)
                if values else None
            )
            for name, values in angles.items()
        },
    }

    TIMELINE_PATH.write_text(
        json.dumps(timeline, indent=2, allow_nan=False),
        encoding="utf-8",
    )

    output = json.dumps(stats, indent=2, allow_nan=False)
    OUTPUT_PATH.write_text(output, encoding="utf-8")

    print(output)
    print(f"\nSaved stats: {OUTPUT_PATH}")
    print(f"Saved timeline: {TIMELINE_PATH}")


if __name__ == "__main__":
    main()