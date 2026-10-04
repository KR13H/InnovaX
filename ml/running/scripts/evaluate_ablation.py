from pathlib import Path

import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides.csv"
)


ALL_FEATURES = [
    "stride_frames",
    "left_min_knee_angle",
    "left_max_knee_angle",
    "left_knee_rom",
    "right_min_knee_angle",
    "right_max_knee_angle",
    "right_knee_rom",
    "knee_rom_symmetry",
]


BIOMECHANICS_ONLY = [
    "left_min_knee_angle",
    "left_max_knee_angle",
    "left_knee_rom",
    "right_min_knee_angle",
    "right_max_knee_angle",
    "right_knee_rom",
    "knee_rom_symmetry",
]


def train_and_evaluate(name, features, train_df, test_df):

    X_train = train_df[features]
    y_train = train_df["action_type"]

    X_test = test_df[features]
    y_test = test_df["action_type"]

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=15,
        min_samples_leaf=3,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    balanced = balanced_accuracy_score(
        y_test,
        predictions,
    )

    print("\n" + "=" * 60)
    print(name)
    print("=" * 60)

    print(f"Features: {len(features)}")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Balanced accuracy: {balanced:.4f}")

    print("\nClassification report:\n")

    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )

    print("Feature importance:\n")

    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_,
    }).sort_values(
        "importance",
        ascending=False,
    )

    print(importance.to_string(index=False))

    return accuracy


def main():

    df = pd.read_csv(DATA_FILE)

    # Same subject-independent split as V1
    train_df = df[
        df["subject_id"].isin(range(1, 16))
    ].copy()

    test_df = df[
        df["subject_id"].isin([19, 20, 21])
    ].copy()

    print(f"Training strides: {len(train_df)}")
    print(f"Testing strides: {len(test_df)}")

    full_accuracy = train_and_evaluate(
        "MODEL A — ALL FEATURES",
        ALL_FEATURES,
        train_df,
        test_df,
    )

    biomechanics_accuracy = train_and_evaluate(
        "MODEL B — NO STRIDE_FRAMES",
        BIOMECHANICS_ONLY,
        train_df,
        test_df,
    )

    print("\n" + "=" * 60)
    print("ABLATION RESULT")
    print("=" * 60)

    difference = full_accuracy - biomechanics_accuracy

    print(
        f"All features accuracy:       "
        f"{full_accuracy:.4f}"
    )

    print(
        f"Biomechanics-only accuracy: "
        f"{biomechanics_accuracy:.4f}"
    )

    print(
        f"Accuracy change:             "
        f"{difference:+.4f}"
    )


if __name__ == "__main__":
    main()