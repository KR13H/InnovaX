from pathlib import Path

import cv2
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

from app.vision.features import extract_features
from app.vision.pose_estimator import PoseEstimator


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "tennis" / "images"
OUTPUT = ROOT / "ml_models"

LABELS = ["backhand", "forehand", "ready_position", "serve"]


def main():
    features = []
    labels = []

    with PoseEstimator() as detector:
        for label in LABELS:
            folder = DATA / label

            if not folder.is_dir():
                raise FileNotFoundError(f"Missing folder: {folder}")

            files = sorted(
                path for path in folder.iterdir()
                if path.suffix.lower() in {".jpg", ".jpeg", ".png"}
            )

            if not files:
                raise RuntimeError(f"No images found in: {folder}")

            accepted = 0
            print(f"\nProcessing {label}: {len(files)} images", flush=True)

            for index, path in enumerate(files, start=1):
                image = cv2.imread(str(path))

                if image is not None:
                    height, width = image.shape[:2]
                    landmarks = detector.detect(image)
                    values = extract_features(landmarks, width, height)

                    if values is not None and np.isfinite(values).all():
                        features.append(values)
                        labels.append(label)
                        accepted += 1

                if index % 50 == 0 or index == len(files):
                    print(
                        f"{label}: processed {index}/{len(files)}, "
                        f"kept {accepted}",
                        flush=True,
                    )

            if accepted < 10:
                raise RuntimeError(
                    f"Too few usable images for {label}: {accepted}"
                )

    X = np.asarray(features, dtype=np.float32)
    y = np.asarray(labels)

    OUTPUT.mkdir(parents=True, exist_ok=True)

    np.savez_compressed(
        OUTPUT / "tennis_features.npz",
        X=X,
        y=y,
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    print(
        f"\nTraining on {len(X_train)} images; "
        f"testing on {len(X_test)} images.",
        flush=True,
    )

    model = RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    print("\nHeld-out image results:")
    print(
        classification_report(
            y_test,
            predictions,
            labels=LABELS,
            zero_division=0,
        )
    )

    print("Confusion matrix: rows = actual, columns = predicted")
    print("Class order:", LABELS)
    print(confusion_matrix(y_test, predictions, labels=LABELS))

    print(
        "\nThis random image split may include similar frames in both "
        "sets. It does not establish accuracy on new players or videos."
    )

    model_path = OUTPUT / "tennis_classifier.joblib"
    joblib.dump(model, model_path)

    print(f"\nSaved: {model_path}", flush=True)


if __name__ == "__main__":
    main()