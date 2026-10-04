from pathlib import Path

import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides.csv"
)


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

    subjects = sorted(df["subject_id"].unique())

    print("=" * 65)
    print("LEAVE-ONE-ATHLETE-OUT CROSS VALIDATION")
    print("=" * 65)

    print(f"Total strides: {len(df)}")
    print(f"Total athletes: {len(subjects)}")
    print()

    results = []

    for subject in subjects:

        train_df = df[
            df["subject_id"] != subject
        ]

        test_df = df[
            df["subject_id"] == subject
        ]

        X_train = train_df[FEATURES]
        y_train = train_df["action_type"]

        X_test = test_df[FEATURES]
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

        results.append({
            "subject_id": subject,
            "strides": len(test_df),
            "accuracy": accuracy,
            "balanced_accuracy": balanced,
        })

        print(
            f"Subject {subject:>2} | "
            f"strides: {len(test_df):>4} | "
            f"accuracy: {accuracy:.4f} | "
            f"balanced: {balanced:.4f}"
        )

    results_df = pd.DataFrame(results)

    print()
    print("=" * 65)
    print("CROSS-VALIDATION SUMMARY")
    print("=" * 65)

    print(
        f"Mean accuracy:     "
        f"{results_df['accuracy'].mean():.4f}"
    )

    print(
        f"Median accuracy:   "
        f"{results_df['accuracy'].median():.4f}"
    )

    print(
        f"Std deviation:     "
        f"{results_df['accuracy'].std():.4f}"
    )

    print(
        f"Worst accuracy:    "
        f"{results_df['accuracy'].min():.4f}"
    )

    print(
        f"Best accuracy:     "
        f"{results_df['accuracy'].max():.4f}"
    )

    print()

    worst = results_df.loc[
        results_df["accuracy"].idxmin()
    ]

    best = results_df.loc[
        results_df["accuracy"].idxmax()
    ]

    print(
        f"Worst athlete: Subject "
        f"{int(worst['subject_id'])}"
    )

    print(
        f"Best athlete:  Subject "
        f"{int(best['subject_id'])}"
    )

    # Weighted accuracy across all held-out predictions
    weighted_accuracy = (
        (
            results_df["accuracy"]
            * results_df["strides"]
        ).sum()
        / results_df["strides"].sum()
    )

    print(
        f"Weighted accuracy: "
        f"{weighted_accuracy:.4f}"
    )

    # Save evaluation
    output_file = (
        BASE_DIR
        / "data"
        / "processed"
        / "running_cross_validation.csv"
    )

    results_df.to_csv(
        output_file,
        index=False,
    )

    print()
    print(
        f"Results saved to: {output_file}"
    )


if __name__ == "__main__":
    main()