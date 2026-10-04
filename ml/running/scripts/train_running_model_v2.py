from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides_v2.csv"
)

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = (
    MODEL_DIR
    / "running_classifier_v2.joblib"
)


# ============================================================
# V2 FEATURES
# ============================================================

FEATURES = [

    # Timing
    "stride_frames",

    # Knee
    "left_min_knee_angle",
    "left_max_knee_angle",
    "left_knee_rom",

    "right_min_knee_angle",
    "right_max_knee_angle",
    "right_knee_rom",

    "knee_rom_symmetry",

    # Hip
    "left_min_hip_angle",
    "left_max_hip_angle",
    "left_hip_rom",

    "right_min_hip_angle",
    "right_max_hip_angle",
    "right_hip_rom",

    "hip_rom_symmetry",

    # Torso
    "torso_lean_mean",
    "torso_lean_max",
    "torso_lean_std",

    # Ankle
    "left_ankle_x_range",
    "left_ankle_y_range",

    "right_ankle_x_range",
    "right_ankle_y_range",

    "ankle_x_symmetry",
    "ankle_y_symmetry",
]


def main():

    df = pd.read_csv(DATA_FILE)

    print(
        f"Loaded {len(df)} V2 strides."
    )

    print(
        f"Using {len(FEATURES)} features."
    )

    # ========================================================
    # SAME SUBJECT SPLIT AS V1
    # ========================================================

    train_subjects = list(range(1, 16))
    validation_subjects = [16, 17, 18]
    test_subjects = [19, 20, 21]

    train_df = df[
        df["subject_id"].isin(
            train_subjects
        )
    ].copy()

    validation_df = df[
        df["subject_id"].isin(
            validation_subjects
        )
    ].copy()

    test_df = df[
        df["subject_id"].isin(
            test_subjects
        )
    ].copy()

    print()
    print("Dataset split")
    print("-" * 50)

    print(
        f"Training:   "
        f"{len(train_df)} strides"
    )

    print(
        f"Validation: "
        f"{len(validation_df)} strides"
    )

    print(
        f"Testing:    "
        f"{len(test_df)} strides"
    )

    # ========================================================
    # PREPARE DATA
    # ========================================================

    X_train = train_df[FEATURES]
    y_train = train_df["action_type"]

    X_validation = validation_df[FEATURES]
    y_validation = validation_df[
        "action_type"
    ]

    X_test = test_df[FEATURES]
    y_test = test_df["action_type"]

    # ========================================================
    # RANDOM FOREST
    # ========================================================

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    print()
    print("Training V2 Random Forest...")

    model.fit(
        X_train,
        y_train,
    )

    print("Training complete.")

    # ========================================================
    # VALIDATION
    # ========================================================

    validation_predictions = (
        model.predict(
            X_validation
        )
    )

    validation_accuracy = (
        accuracy_score(
            y_validation,
            validation_predictions,
        )
    )

    validation_balanced = (
        balanced_accuracy_score(
            y_validation,
            validation_predictions,
        )
    )

    print()
    print("=" * 60)
    print("V2 VALIDATION RESULTS")
    print("=" * 60)

    print(
        f"Accuracy: "
        f"{validation_accuracy:.4f}"
    )

    print(
        f"Balanced accuracy: "
        f"{validation_balanced:.4f}"
    )

    print()

    print(
        classification_report(
            y_validation,
            validation_predictions,
            digits=4,
        )
    )

    # ========================================================
    # TEST
    # ========================================================

    test_predictions = (
        model.predict(
            X_test
        )
    )

    test_accuracy = (
        accuracy_score(
            y_test,
            test_predictions,
        )
    )

    test_balanced = (
        balanced_accuracy_score(
            y_test,
            test_predictions,
        )
    )

    print()
    print("=" * 60)
    print("V2 TEST RESULTS - UNSEEN ATHLETES")
    print("=" * 60)

    print(
        f"Accuracy: "
        f"{test_accuracy:.4f}"
    )

    print(
        f"Balanced accuracy: "
        f"{test_balanced:.4f}"
    )

    print()

    print(
        classification_report(
            y_test,
            test_predictions,
            digits=4,
        )
    )

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

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

    print()
    print("Confusion matrix:")
    print()

    print(matrix_df)

    # ========================================================
    # PERFORMANCE PER ATHLETE
    # ========================================================

    print()
    print("=" * 60)
    print("V2 PERFORMANCE BY TEST ATHLETE")
    print("=" * 60)

    for subject in test_subjects:

        subject_df = test_df[
            test_df["subject_id"]
            == subject
        ]

        X_subject = subject_df[
            FEATURES
        ]

        y_subject = subject_df[
            "action_type"
        ]

        predictions = model.predict(
            X_subject
        )

        subject_accuracy = (
            accuracy_score(
                y_subject,
                predictions,
            )
        )

        print(
            f"Subject {subject}: "
            f"{subject_accuracy:.4f} "
            f"({len(subject_df)} strides)"
        )

    # ========================================================
    # FEATURE IMPORTANCE
    # ========================================================

    importance_df = pd.DataFrame({
        "feature":
            FEATURES,

        "importance":
            model.feature_importances_,
    })

    importance_df = (
        importance_df.sort_values(
            "importance",
            ascending=False,
        )
    )

    print()
    print("=" * 60)
    print("V2 FEATURE IMPORTANCE")
    print("=" * 60)

    print(
        importance_df.to_string(
            index=False
        )
    )

    # ========================================================
    # SAVE MODEL
    # ========================================================

    joblib.dump(
        {
            "model": model,
            "features": FEATURES,
            "version": "v2",
        },
        MODEL_FILE,
    )

    print()
    print(
        f"V2 model saved to: "
        f"{MODEL_FILE}"
    )


if __name__ == "__main__":
    main()