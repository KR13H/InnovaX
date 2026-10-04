import argparse
import csv
import json
from pathlib import Path

import cv2
import joblib
import numpy as np
from ultralytics import YOLO

from app.vision.features import extract_features
from app.vision.pose_estimator import PoseEstimator


ROOT = Path(__file__).resolve().parent
LABELS = ["backhand", "forehand", "ready_position", "serve"]
EXTENSIONS = {".avi", ".mp4", ".mov", ".mkv"}


def analyze_video(path, expected, classifier, args):
    # A fresh YOLO instance resets tracking between videos.
    yolo = YOLO(str(args.yolo))
    target_id = None

    timeline = []
    probability_sum = np.zeros(len(classifier.classes_), dtype=float)
    processed = tracked = pose_frames = usable = 0

    results = yolo.track(
        source=str(path),
        tracker="bytetrack.yaml",
        classes=[0],
        stream=True,
        verbose=False,
        vid_stride=1,
    )

    try:
        with PoseEstimator() as detector:
            for frame_index, result in enumerate(results):
                processed += 1
                row = {
                    "frame": frame_index,
                    "tracked": False,
                    "pose_detected": False,
                    "prediction": None,
                    "confidence": None,
                }

                boxes = result.boxes

                if boxes is not None and boxes.id is not None:
                    ids = boxes.id.cpu().numpy().astype(int)
                    coordinates = boxes.xyxy.cpu().numpy()

                    if target_id is None and len(ids):
                        if args.target_id is not None:
                            target_id = args.target_id
                        else:
                            # Dataset clips usually feature one athlete.
                            # Largest person is a heuristic, not verification.
                            areas = (
                                (coordinates[:, 2] - coordinates[:, 0])
                                * (coordinates[:, 3] - coordinates[:, 1])
                            )
                            target_id = int(ids[np.argmax(areas)])

                    matches = np.flatnonzero(ids == target_id)

                    if len(matches):
                        tracked += 1
                        row["tracked"] = True

                        frame = result.orig_img
                        height, width = frame.shape[:2]
                        x1, y1, x2, y2 = coordinates[int(matches[0])]

                        padding = 0.25 * max(x2 - x1, y2 - y1)
                        x1 = max(0, int(x1 - padding))
                        y1 = max(0, int(y1 - padding))
                        x2 = min(width, int(x2 + padding))
                        y2 = min(height, int(y2 + padding))

                        crop = frame[y1:y2, x1:x2]

                        if crop.size:
                            landmarks = detector.detect(crop)

                            if landmarks is not None:
                                pose_frames += 1
                                row["pose_detected"] = True

                                # Hip/torso normalization makes these crop
                                # features equivalent to mapped coordinates.
                                values = extract_features(
                                    landmarks,
                                    crop.shape[1],
                                    crop.shape[0],
                                )

                                if (
                                    values is not None
                                    and np.isfinite(values).all()
                                ):
                                    probabilities = classifier.predict_proba(
                                        np.asarray([values], dtype=np.float32)
                                    )[0]

                                    usable += 1
                                    probability_sum += probabilities
                                    best = int(np.argmax(probabilities))

                                    row["prediction"] = str(
                                        classifier.classes_[best]
                                    )
                                    row["confidence"] = float(
                                        probabilities[best]
                                    )

                timeline.append(row)

    finally:
        results.close()

    # Clip-level baseline: average probabilities over usable frames.
    # This does not measure frame-level action accuracy.
    if usable:
        average = probability_sum / usable
        best = int(np.argmax(average))
        prediction = str(classifier.classes_[best])
        confidence = float(average[best])
    else:
        prediction = "no_prediction"
        confidence = None

    summary = {
        "video": str(path.relative_to(args.data)),
        "expected": expected,
        "prediction": prediction,
        "correct": prediction == expected,
        "clip_confidence": confidence,
        "target_track_id": target_id,
        "processed_frames": processed,
        "tracked_frames": tracked,
        "pose_frames": pose_frames,
        "usable_frames": usable,
        "tracking_coverage_percent": (
            100.0 * tracked / processed if processed else 0.0
        ),
        "usable_coverage_percent": (
            100.0 * usable / processed if processed else 0.0
        ),
        "error": None,
    }

    return summary, timeline


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data",
        type=Path,
        default=ROOT / "data" / "tennis" / "videos",
    )
    parser.add_argument(
        "--model",
        type=Path,
        default=ROOT / "ml_models" / "tennis_classifier.joblib",
    )
    parser.add_argument(
        "--yolo", type=Path, default=ROOT / "yolov8n.pt"
    )
    parser.add_argument(
        "--output", type=Path, default=ROOT / "batch_results"
    )
    parser.add_argument("--target-id", type=int, default=None)
    args = parser.parse_args()

    classifier = joblib.load(args.model)

    if set(map(str, classifier.classes_)) != set(LABELS):
        raise RuntimeError("Classifier classes do not match LABELS.")

    videos = [
        (path, label)
        for label in LABELS
        for path in sorted((args.data / label).rglob("*"))
        if path.is_file() and path.suffix.lower() in EXTENSIONS
    ]

    if not videos:
        raise RuntimeError(f"No videos found under {args.data}")

    args.output.mkdir(parents=True, exist_ok=True)
    summaries = []

    for index, (path, expected) in enumerate(videos, start=1):
        print(f"[{index}/{len(videos)}] {path.name}", flush=True)

        try:
            summary, timeline = analyze_video(
                path, expected, classifier, args
            )

            destination = (
                args.output
                / "timelines"
                / path.relative_to(args.data).parent
                / f"{path.name}.json"
            )
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(
                json.dumps(timeline, indent=2, allow_nan=False),
                encoding="utf-8",
            )

            print(
                f"  Expected: {expected}; "
                f"predicted: {summary['prediction']}; "
                f"usable: {summary['usable_coverage_percent']:.1f}%",
                flush=True,
            )

        except Exception as error:
            summary = {
                "video": str(path.relative_to(args.data)),
                "expected": expected,
                "prediction": "error",
                "correct": False,
                "error": f"{type(error).__name__}: {error}",
            }
            print(f"  Failed: {summary['error']}", flush=True)

        summaries.append(summary)

        # Save progress after every video.
        (args.output / "summary.json").write_text(
            json.dumps(summaries, indent=2, allow_nan=False),
            encoding="utf-8",
        )

    columns = sorted({key for row in summaries for key in row})
    with (args.output / "summary.csv").open(
        "w", newline="", encoding="utf-8"
    ) as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(summaries)

    correct = sum(row["correct"] for row in summaries)
    predicted = sum(
        row["prediction"] in LABELS for row in summaries
    )

    print(
        f"\nCorrect clips / all clips: "
        f"{correct}/{len(summaries)} "
        f"({100 * correct / len(summaries):.1f}%)"
    )
    print(f"Clips with predictions: {predicted}/{len(summaries)}")

    for label in LABELS:
        rows = [row for row in summaries if row["expected"] == label]
        if rows:
            hits = sum(row["correct"] for row in rows)
            print(f"{label}: {hits}/{len(rows)} correct")

    print(f"Results saved in: {args.output}")


if __name__ == "__main__":
    main()