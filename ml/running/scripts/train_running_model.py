from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides.csv"
)

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = MODEL_DIR / "running_classifier.joblib"


FEATURES = [
    "stride_frames",
    "left_min_knee_angle",
    "left_max_knee_angle",
    "left_knee_rom",
    "right_min_knee_angle",
    "right_max_knee_angle",
    "right_knee_rom",
    "knee_rom_symmetry",
]


def main():

    df = pd.read_csv(DATA_FILE)

    print(f"Loaded {len(df)} strides.")
    print()

    # --------------------------------------------------
    # IMPORTANT:
    # Split by ATHLETE, not randomly by individual stride.
    #
    # The model must be tested on people it never saw
    # during training.
    # --------------------------------------------------

    train_subjects = list(range(1, 16))
    validation_subjects = [16, 17, 18]
    test_subjects = [19, 20, 21]

    train_df = df[
        df["subject_id"].isin(train_subjects)
    ].copy()

    validation_df = df[
        df["subject_id"].isin(validation_subjects)
    ].copy()

    test_df = df[
        df["subject_id"].isin(test_subjects)
    ].copy()

    print("Dataset split")
    print("-" * 40)

    print(
        f"Training:   {len(train_df)} strides "
        f"({len(train_subjects)} athletes)"
    )

    print(
        f"Validation: {len(validation_df)} strides "
        f"({len(validation_subjects)} athletes)"
    )

    print(
        f"Testing:    {len(test_df)} strides "
        f"({len(test_subjects)} athletes)"
    )

    print()

    X_train = train_df[FEATURES]
    y_train = train_df["action_type"]

    X_validation = validation_df[FEATURES]
    y_validation = validation_df["action_type"]

    X_test = test_df[FEATURES]
    y_test = test_df["action_type"]

    # --------------------------------------------------
    # MODEL
    # --------------------------------------------------

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=3,

        # Helps compensate for our class imbalance
        class_weight="balanced",

        random_state=42,
        n_jobs=-1,
    )

    print("Training Random Forest...")

    # THIS IS THE ACTUAL MODEL TRAINING
    model.fit(
        X_train,
        y_train,
    )

    print("Training complete.")
    print()

    # --------------------------------------------------
    # VALIDATION
    # --------------------------------------------------

    validation_predictions = model.predict(
        X_validation
    )

    validation_accuracy = accuracy_score(
        y_validation,
        validation_predictions,
    )

    print("=" * 50)
    print("VALIDATION RESULTS")
    print("=" * 50)

    print(
        f"Accuracy: "
        f"{validation_accuracy:.3f}"
    )

    print()

    print(
        classification_report(
            y_validation,
            validation_predictions,
        )
    )

    # --------------------------------------------------
    # FINAL TEST
    # --------------------------------------------------

    test_predictions = model.predict(
        X_test
    )

    test_accuracy = accuracy_score(
        y_test,
        test_predictions,
    )

    print("=" * 50)
    print("TEST RESULTS - UNSEEN ATHLETES")
    print("=" * 50)

    print(
        f"Accuracy: "
        f"{test_accuracy:.3f}"
    )

    print()

    print(
        classification_report(
            y_test,
            test_predictions,
        )
    )

    print("Confusion matrix:")
    print()

    labels = [
        "slow_walk",
        "fast_walk",
        "jog",
    ]

    matrix = confusion_matrix(
        y_test,
        test_predictions,
        labels=labels,
    )

    matrix_df = pd.DataFrame(
        matrix,
        index=labels,
        columns=labels,
    )

    print(matrix_df)

    # --------------------------------------------------
    # FEATURE IMPORTANCE
    # --------------------------------------------------

    print()
    print("=" * 50)
    print("FEATURE IMPORTANCE")
    print("=" * 50)

    importance_df = pd.DataFrame({
        "feature": FEATURES,
        "importance": model.feature_importances_,
    })

    importance_df = importance_df.sort_values(
        "importance",
        ascending=False,
    )

    print(
        importance_df.to_string(
            index=False
        )
    )

    # --------------------------------------------------
    # SAVE MODEL
    # --------------------------------------------------

    joblib.dump(
        {
            "model": model,
            "features": FEATURES,
        },
        MODEL_FILE,
    )

    print()
    print(
        f"Model saved to: {MODEL_FILE}"
    )


if __name__ == "__main__":
    main()