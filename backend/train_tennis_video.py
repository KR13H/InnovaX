import argparse
import json
import re
from pathlib import Path

import cv2
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from ultralytics import YOLO

from app.vision.features import extract_features
from app.vision.pose_estimator import PoseEstimator


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "tennis" / "videos"
OUTPUT = ROOT / "ml_models" / "tennis_video"
CACHE = OUTPUT / "pose_cache"

LABELS = ["backhand", "forehand", "serve"]
STEPS = 32

# These players appeared in the batch we already inspected.
DEVELOPMENT_PLAYERS = {
    13, 23, 29, 30, 37, 38, 44, 51, 52, 54
}


def extract_sequence(path):
    """Extract one feature vector per frame, preserving missing frames."""
    yolo = YOLO(str(ROOT / "yolov8n.pt"))
    rows = []
    target_id = None

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
            for result in results:
                values = np.full(36, np.nan, dtype=np.float32)
                boxes = result.boxes

                if boxes is not None and boxes.id is not None:
                    ids = boxes.id.cpu().numpy().astype(int)
                    coordinates = boxes.xyxy.cpu().numpy()

                    if target_id is None and len(ids):
                        areas = (
                            (coordinates[:, 2] - coordinates[:, 0])
                            * (coordinates[:, 3] - coordinates[:, 1])
                        )
                        target_id = int(ids[np.argmax(areas)])

                    matches = np.flatnonzero(ids == target_id)

                    if len(matches):
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
                            candidate = extract_features(
                                landmarks,
                                crop.shape[1],
                                crop.shape[0],
                            )

                            if (
                                candidate is not None
                                and np.asarray(candidate).shape == (36,)
                                and np.isfinite(candidate).all()
                            ):
                                values = np.asarray(
                                    candidate, dtype=np.float32
                                )

                rows.append(values)

    finally:
        results.close()

    return np.asarray(rows, dtype=np.float32).reshape(-1, 36)


def sequence_features(sequence):
    """Resample poses over clip time and include changes in position."""
    valid = np.isfinite(sequence).all(axis=1)
    coverage = float(valid.mean()) if len(valid) else 0.0

    if len(sequence) < 8 or valid.sum() < 8 or coverage < 0.8:
        return None, coverage

    # Reject long missing runs rather than inventing a long motion.
    longest_gap = current_gap = 0
    for present in valid:
        current_gap = 0 if present else current_gap + 1
        longest_gap = max(longest_gap, current_gap)

    if longest_gap > max(3, int(0.1 * len(sequence))):
        return None, coverage

    source_times = np.flatnonzero(valid)
    target_times = np.linspace(0, len(sequence) - 1, STEPS)

    sampled = np.column_stack([
        np.interp(
            target_times,
            source_times,
            sequence[valid, column],
        )
        for column in range(36)
    ]).astype(np.float32)

    # Position changes across normalized clip time, not physical velocity.
    changes = np.diff(sampled[:, :24], axis=0)
    observed = np.interp(
        target_times, np.arange(len(sequence)), valid.astype(float)
    )

    features = np.concatenate([
        sampled.flatten(),
        changes.flatten(),
        observed,
    ]).astype(np.float32)

    return features, coverage


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--test",
        action="store_true",
        help="Evaluate the saved model on reserved test players.",
    )
    args = parser.parse_args()

    OUTPUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)

    videos = []
    for label in LABELS:
        for path in sorted((DATA / label).rglob("*.avi")):
            match = re.match(r"p(\d+)_", path.name)
            if not match:
                raise RuntimeError(f"Cannot identify player: {path}")
            videos.append((path, label, int(match.group(1))))

    if not videos:
        raise RuntimeError(f"No AVI videos found in {DATA}")

    players = sorted({player for _, _, player in videos})

    # Reserve unseen players before extracting/training anything.
    unseen = [
        player for player in players
        if player not in DEVELOPMENT_PLAYERS
    ]
    np.random.default_rng(42).shuffle(unseen)

    n_test = max(1, round(0.2 * len(players)))
    n_validation = max(1, round(0.2 * len(players)))

    if len(unseen) < n_test + n_validation:
        raise RuntimeError("Not enough unseen players for separate splits.")

    test_players = set(unseen[:n_test])
    validation_players = set(
        unseen[n_test:n_test + n_validation]
    )
    train_players = (
        set(players) - test_players - validation_players
    )

    splits = {
        "train": sorted(train_players),
        "validation": sorted(validation_players),
        "test": sorted(test_players),
    }

    split_path = OUTPUT / "player_splits.json"
    if split_path.exists():
        saved = json.loads(split_path.read_text())
        if saved != splits:
            raise RuntimeError(
                "Dataset player list changed. Use a new output directory "
                "rather than silently changing the evaluation split."
            )
    else:
        split_path.write_text(json.dumps(splits, indent=2))

    wanted_players = (
        test_players if args.test
        else train_players | validation_players
    )
    selected = [
        item for item in videos if item[2] in wanted_players
    ]

    X, y, groups = [], [], []
    audit = []

    for index, (path, label, player) in enumerate(selected, start=1):
        print(
            f"[{index}/{len(selected)}] Extracting {path.name}",
            flush=True,
        )

        cache_path = CACHE / label / f"{path.name}.npz"
        cache_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            if cache_path.exists():
                with np.load(cache_path) as stored:
                    sequence = stored["sequence"]
            else:
                sequence = extract_sequence(path)
                np.savez_compressed(cache_path, sequence=sequence)

            values, coverage = sequence_features(sequence)
            accepted = values is not None
            audit.append({
                "video": str(path.relative_to(DATA)),
                "label": label,
                "player": player,
                "coverage": coverage,
                "accepted": accepted,
            })

            print(
                f"  Coverage: {coverage:.1%}; "
                f"{'accepted' if accepted else 'rejected'}",
                flush=True,
            )

            if accepted:
                X.append(values)
                y.append(label)
                groups.append(player)

        except Exception as error:
            audit.append({
                "video": str(path.relative_to(DATA)),
                "label": label,
                "player": player,
                "accepted": False,
                "error": str(error),
            })
            print(f"  Failed: {error}", flush=True)

    audit_name = "test_extraction.json" if args.test else "extraction.json"
    (OUTPUT / audit_name).write_text(
        json.dumps(audit, indent=2), encoding="utf-8"
    )

    if not X:
        raise RuntimeError("No usable clips. Inspect extraction report.")

    X = np.asarray(X, dtype=np.float32)
    y = np.asarray(y)
    groups = np.asarray(groups)
    model_path = OUTPUT / "tennis_video_classifier.joblib"

    if args.test:
        bundle = joblib.load(model_path)
        predictions = bundle["model"].predict(X)

        print("\nRESERVED TEST PLAYER RESULTS:")
        print(classification_report(
            y, predictions, labels=LABELS, zero_division=0
        ))
        print("Rows = actual; columns = predicted:", LABELS)
        print(confusion_matrix(y, predictions, labels=LABELS))

        correct = int(np.sum(predictions == y))
        print(f"Accepted clips: {len(y)}/{len(selected)}")
        print(
            f"Correct / all attempted clips: "
            f"{correct}/{len(selected)} "
            f"({100 * correct / len(selected):.1f}%)"
        )
        return

    train = np.isin(groups, list(train_players))
    validation = np.isin(groups, list(validation_players))

    for name, mask in [("train", train), ("validation", validation)]:
        if set(y[mask]) != set(LABELS):
            raise RuntimeError(f"{name} is missing a usable class.")

    print(
        f"\nTraining: {train.sum()} clips; "
        f"validation: {validation.sum()} clips.",
        flush=True,
    )

    best_model = None
    best_score = -1
    best_leaf = None

    for leaf in [1, 2, 4]:
        print(f"TRAINING MODEL: min_samples_leaf={leaf}", flush=True)

        model = RandomForestClassifier(
            n_estimators=400,
            min_samples_leaf=leaf,
            class_weight="balanced",
            random_state=42,
            n_jobs=2,
        )
        model.fit(X[train], y[train])
        predictions = model.predict(X[validation])

        # Select by macro recall: each class has equal weight.
        score = np.mean([
            np.mean(predictions[y[validation] == label] == label)
            for label in LABELS
        ])
        print(f"Validation macro recall: {score:.3f}", flush=True)

        if score > best_score:
            best_score = score
            best_model = model
            best_leaf = leaf

    predictions = best_model.predict(X[validation])
    print("\nVALIDATION RESULTS:")
    print(classification_report(
        y[validation], predictions, labels=LABELS, zero_division=0
    ))
    print("Rows = actual; columns = predicted:", LABELS)
    print(confusion_matrix(
        y[validation], predictions, labels=LABELS
    ))

    joblib.dump({
        "model": best_model,
        "labels": LABELS,
        "steps": STEPS,
        "feature_count": X.shape[1],
        "min_samples_leaf": best_leaf,
        "player_splits": splits,
        "task": "whole_clip_action",
    }, model_path)

    print(f"\nTRAINING COMPLETE. Saved: {model_path}", flush=True)
    print("Reserved test players have not been evaluated.")


if __name__ == "__main__":
    main()