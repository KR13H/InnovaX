"""Export real tennis-pipeline output (no pixels) for the demo video.

Mirrors backend/analyze_tennis_yolo.py: YOLOv8n + ByteTrack person tracking -> MediaPipe pose on
the tracked player's crop -> Random Forest action classifier (tennis_classifier.joblib), plus the
same shot-event grouping and joint angles. Differences: uses the MediaPipe estimator from
app/vision/tennis_pose_estimator.py (app/vision/pose_estimator.py is now the cricket RTMPose one),
picks the most prominent track instead of hard-coding id 1, and writes per-frame geometry.

Usage (from the repo root, with the backend venv):
  .venv/bin/python demo-video/scripts/export_tennis_output.py <absolute video path> <out.json>
then run demo-video/scripts/slim-tennis-output.py <out.json> to refresh src/data/tennis-output.json.
"""

import json
import os
import sys
from pathlib import Path
from types import SimpleNamespace

BACKEND = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND))
os.chdir(Path(__file__).parent)  # yolov8n.pt is fetched/kept here, not in the repo

import cv2  # noqa: E402
import joblib  # noqa: E402
import numpy as np  # noqa: E402
from ultralytics import YOLO  # noqa: E402

from analyze_tennis_yolo import CONNECTIONS, JOINTS, estimate_shots  # noqa: E402
from app.vision.features import extract_features  # noqa: E402
from app.vision.landmark_utils import landmark_angle  # noqa: E402
from app.vision.tennis_pose_estimator import PoseEstimator  # noqa: E402

CONFIDENCE_THRESHOLD = 0.6


def main(video: str, out: str):
    classifier = joblib.load(BACKEND / "ml_models" / "tennis_classifier.joblib")
    yolo = YOLO("yolov8n.pt")

    cap = cv2.VideoCapture(video)
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()

    # Pass 1: track every person, keep boxes per frame.
    tracked = []
    for r in yolo.track(source=video, tracker="bytetrack.yaml", classes=[0], stream=True, verbose=False, persist=True):
        boxes = {}
        if r.boxes is not None and r.boxes.id is not None:
            for tid, xyxy in zip(r.boxes.id.cpu().numpy().astype(int), r.boxes.xyxy.cpu().numpy()):
                boxes[int(tid)] = [float(v) for v in xyxy]
        tracked.append((r.orig_img.copy(), boxes))

    # Most prominent player: largest summed box area across the clip.
    area = {}
    for _, boxes in tracked:
        for tid, (x1, y1, x2, y2) in boxes.items():
            area[tid] = area.get(tid, 0) + (x2 - x1) * (y2 - y1)
    target = max(area, key=area.get)

    counts = {str(c): 0 for c in classifier.classes_}
    counts["unknown"] = 0
    angles = {n: [] for n in JOINTS}
    frames, timeline = [], []
    poses = tracked_frames = 0

    with PoseEstimator() as detector:
        for i, (frame, boxes) in enumerate(tracked):
            h, w = frame.shape[:2]
            row = {"i": i, "t": round(i / fps, 3), "ids": sorted(boxes), "box": None, "lm": None, "label": "not_tracked", "guess": None, "conf": None, "probs": None, "angles": {}}
            others = {tid: [round(b[0] / w, 4), round(b[1] / h, 4), round(b[2] / w, 4), round(b[3] / h, 4)] for tid, b in boxes.items() if tid != target}
            row["others"] = others
            if target in boxes:
                tracked_frames += 1
                x1, y1, x2, y2 = boxes[target]
                row["box"] = [round(x1 / w, 4), round(y1 / h, 4), round(x2 / w, 4), round(y2 / h, 4)]
                pad = 0.25 * max(x2 - x1, y2 - y1)
                cx1, cy1 = max(0, int(x1 - pad)), max(0, int(y1 - pad))
                cx2, cy2 = min(w, int(x2 + pad)), min(h, int(y2 + pad))
                crop = frame[cy1:cy2, cx1:cx2]
                lms = detector.detect(crop) if crop.size else None
                row["label"] = "unknown"
                if lms is not None:
                    poses += 1
                    mapped = [SimpleNamespace(x=(cx1 + p.x * (cx2 - cx1)) / w, y=(cy1 + p.y * (cy2 - cy1)) / h, visibility=p.visibility or 0.0) for p in lms]
                    row["lm"] = [[round(p.x, 4), round(p.y, 4), round(p.visibility, 3)] for p in mapped]
                    vals = extract_features(mapped, w, h)
                    if vals is not None and np.isfinite(vals).all():
                        pr = classifier.predict_proba([vals])[0]
                        b = int(np.argmax(pr))
                        row["guess"] = str(classifier.classes_[b])
                        row["conf"] = round(float(pr[b]), 4)
                        row["probs"] = {str(c): round(float(p), 4) for c, p in zip(classifier.classes_, pr)}
                        if pr[b] >= CONFIDENCE_THRESHOLD:
                            row["label"] = row["guess"]
                    for name, idx in JOINTS.items():
                        a = landmark_angle(mapped, idx, w, h)
                        if a is not None and np.isfinite(a):
                            angles[name].append(a)
                            row["angles"][name] = round(float(a), 1)
                counts[row["label"]] += 1
            frames.append(row)
            timeline.append({"frame": i, "time_seconds": row["t"], "player_tracked": row["box"] is not None, "pose_detected": row["lm"] is not None, "label": row["label"]})

    shot_counts, shot_events = estimate_shots(timeline, fps)
    stats = {
        "sport": "tennis",
        "estimated_shot_counts": shot_counts,
        "estimated_shot_events": shot_events,
        "target_track_id": target,
        "fps": round(float(fps), 3),
        "processed_frames": len(tracked),
        "tracked_player_frames": tracked_frames,
        "pose_detected_frames": poses,
        "tracking_coverage_percent": round(100 * tracked_frames / len(tracked), 1),
        "pose_frame_counts": counts,
        "mean_joint_angles_degrees": {n: (round(float(np.mean(v)), 1) if v else None) for n, v in angles.items()},
    }
    h, w = tracked[0][0].shape[:2]
    Path(out).write_text(json.dumps({"source": {"width": w, "height": h, "fps": round(float(fps), 3)}, "connections": CONNECTIONS, "stats": stats, "frames": frames}, allow_nan=False))
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
