from pathlib import Path

import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides_v2.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_cross_validation_v2.csv"
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

    subjects = sorted(
        df["subject_id"].unique()
    )

    print("=" * 70)
    print(
        "RUNNING V2 - "
        "LEAVE-ONE-ATHLETE-OUT CROSS VALIDATION"
    )
    print("=" * 70)

    print(
        f"Total strides: {len(df)}"
    )

    print(
        f"Total athletes: {len(subjects)}"
    )

    print(
        f"Features: {len(FEATURES)}"
    )

    print()

    results = []

    # ========================================================
    # TEST EACH ATHLETE
    # ========================================================

    for subject in subjects:

        # Every athlete except current subject
        train_df = df[
            df["subject_id"] != subject
        ].copy()

        # Current subject is completely unseen
        test_df = df[
            df["subject_id"] == subject
        ].copy()

        X_train = train_df[FEATURES]
        y_train = train_df["action_type"]

        X_test = test_df[FEATURES]
        y_test = test_df["action_type"]

        # Same RF configuration as V1/V2 training
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=15,
            min_samples_leaf=3,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )

        model.fit(
            X_train,
            y_train,
        )

        predictions = model.predict(
            X_test
        )

        accuracy = accuracy_score(
            y_test,
            predictions,
        )

        balanced_accuracy = (
            balanced_accuracy_score(
                y_test,
                predictions,
            )
        )

        results.append({
            "subject_id": subject,
            "strides": len(test_df),
            "accuracy": accuracy,
            "balanced_accuracy":
                balanced_accuracy,
        })

        print(
            f"Subject {int(subject):>2} | "
            f"strides: {len(test_df):>4} | "
            f"accuracy: {accuracy:.4f} | "
            f"balanced: "
            f"{balanced_accuracy:.4f}"
        )

    # ========================================================
    # RESULTS DATAFRAME
    # ========================================================

    results_df = pd.DataFrame(
        results
    )

    # ========================================================
    # SUMMARY
    # ========================================================

    mean_accuracy = (
        results_df["accuracy"].mean()
    )

    median_accuracy = (
        results_df["accuracy"].median()
    )

    std_accuracy = (
        results_df["accuracy"].std()
    )

    worst_accuracy = (
        results_df["accuracy"].min()
    )

    best_accuracy = (
        results_df["accuracy"].max()
    )

    mean_balanced = (
        results_df[
            "balanced_accuracy"
        ].mean()
    )

    weighted_accuracy = (
        (
            results_df["accuracy"]
            * results_df["strides"]
        ).sum()
        / results_df["strides"].sum()
    )

    worst = results_df.loc[
        results_df[
            "accuracy"
        ].idxmin()
    ]

    best = results_df.loc[
        results_df[
            "accuracy"
        ].idxmax()
    ]

    print()
    print("=" * 70)
    print("V2 CROSS-VALIDATION SUMMARY")
    print("=" * 70)

    print(
        f"Mean accuracy:          "
        f"{mean_accuracy:.4f}"
    )

    print(
        f"Mean balanced accuracy: "
        f"{mean_balanced:.4f}"
    )

    print(
        f"Median accuracy:        "
        f"{median_accuracy:.4f}"
    )

    print(
        f"Std deviation:          "
        f"{std_accuracy:.4f}"
    )

    print(
        f"Worst accuracy:         "
        f"{worst_accuracy:.4f}"
    )

    print(
        f"Best accuracy:          "
        f"{best_accuracy:.4f}"
    )

    print(
        f"Weighted accuracy:      "
        f"{weighted_accuracy:.4f}"
    )

    print()

    print(
        f"Worst athlete: "
        f"Subject "
        f"{int(worst['subject_id'])}"
    )

    print(
        f"Best athlete:  "
        f"Subject "
        f"{int(best['subject_id'])}"
    )

    # ========================================================
    # SAVE RESULTS
    # ========================================================

    results_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print()
    print(
        f"Results saved to: "
        f"{OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()