"""Slims export_tennis_output.py's JSON into src/data/tennis-output.json (what the video imports)."""
import json
import sys
from pathlib import Path

src = json.load(open(sys.argv[1]))
frames = [
    {
        "box": f["box"],
        "others": list(f["others"].values()),
        "lm": [[p[0], p[1], round(p[2], 2)] for p in f["lm"]] if f["lm"] else None,
        "label": f["label"],
        "conf": f["conf"],
        "probs": f["probs"],
        "angles": f["angles"],
    }
    for f in src["frames"]
]
out = {
    "source": src["source"],
    "connections": src["connections"],
    "stats": src["stats"],
    "frames": frames,
    "provenance": "backend/analyze_tennis_yolo.py logic (YOLOv8n + ByteTrack -> MediaPipe Pose Landmarker -> RandomForest tennis_classifier.joblib), run on a sample clip; pixels not included.",
}
dest = Path(__file__).resolve().parents[1] / "src" / "data" / "tennis-output.json"
dest.write_text(json.dumps(out, separators=(",", ":")))
print("wrote", dest)
