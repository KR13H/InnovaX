from pathlib import Path

import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    balanced_accuracy_score,
)


BASE_DIR = Path(__file__).resolve().parents[1]

DATA_FILE = BASE_DIR / "data" / "processed" / "running_strides.csv"

# Change this to running_classifier.joblib if you did not rename it
MODEL_FILE = BASE_DIR / "models" / "running_classifier_v1.joblib"


def main():

    df = pd.read_csv(DATA_FILE)

    saved = joblib.load(MODEL_FILE)

    model = saved["model"]
    features = saved["features"]

    print("=" * 60)
    print("SHADOWATHLETE RUNNING MODEL V1 EVALUATION")
    print("=" * 60)

    print(f"\nTotal dataset strides: {len(df)}")
    print(f"Features: {features}")

    # Original held-out test athletes
    test_df = df[df["subject_id"].isin([19, 20, 21])].copy()

    X_test = test_df[features]
    y_test = test_df["action_type"]

    predictions = model.predict(X_test)

    print("\n" + "=" * 60)
    print("1. OVERALL TEST PERFORMANCE")
    print("=" * 60)

    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(
        f"Balanced accuracy: "
        f"{balanced_accuracy_score(y_test, predictions):.4f}"
    )

    print("\nClassification report:\n")

    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
        )
    )

    # -------------------------------------------------
    # Confusion matrix
    # -------------------------------------------------

    labels = ["slow_walk", "fast_walk", "jog"]

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=labels,
    )

    matrix_df = pd.DataFrame(
        matrix,
        index=[f"actual_{x}" for x in labels],
        columns=[f"pred_{x}" for x in labels],
    )

    print("\n" + "=" * 60)
    print("2. CONFUSION MATRIX")
    print("=" * 60)

    print(matrix_df)

    # -------------------------------------------------
    # Accuracy per athlete
    # -------------------------------------------------

    print("\n" + "=" * 60)
    print("3. PERFORMANCE BY UNSEEN ATHLETE")
    print("=" * 60)

    for subject in [19, 20, 21]:

        subject_df = test_df[
            test_df["subject_id"] == subject
        ]

        X_subject = subject_df[features]
        y_subject = subject_df["action_type"]

        pred = model.predict(X_subject)

        accuracy = accuracy_score(
            y_subject,
            pred,
        )

        print(
            f"\nSubject {subject}: "
            f"{accuracy:.4f} "
            f"({len(subject_df)} strides)"
        )

        print(
            pd.crosstab(
                y_subject,
                pred,
                rownames=["Actual"],
                colnames=["Predicted"],
            )
        )

    # -------------------------------------------------
    # Confidence analysis
    # -------------------------------------------------

    print("\n" + "=" * 60)
    print("4. MODEL CONFIDENCE")
    print("=" * 60)

    probabilities = model.predict_proba(X_test)

    confidence = probabilities.max(axis=1)

    results = test_df[
        [
            "subject_id",
            "action_type",
        ]
    ].copy()

    results["prediction"] = predictions
    results["confidence"] = confidence

    correct = results[
        results["action_type"] == results["prediction"]
    ]

    incorrect = results[
        results["action_type"] != results["prediction"]
    ]

    print(
        f"\nAverage confidence overall: "
        f"{confidence.mean():.4f}"
    )

    print(
        f"Average confidence when CORRECT: "
        f"{correct['confidence'].mean():.4f}"
    )

    print(
        f"Average confidence when WRONG: "
        f"{incorrect['confidence'].mean():.4f}"
    )

    # -------------------------------------------------
    # High confidence mistakes
    # -------------------------------------------------

    print("\n" + "=" * 60)
    print("5. HIGH-CONFIDENCE MISTAKES")
    print("=" * 60)

    mistakes = incorrect.sort_values(
        "confidence",
        ascending=False,
    )

    print(
        mistakes.head(20).to_string(
            index=False
        )
    )

    # -------------------------------------------------
    # Feature importance
    # -------------------------------------------------

    print("\n" + "=" * 60)
    print("6. FEATURE IMPORTANCE")
    print("=" * 60)

    importance = pd.DataFrame({
        "feature": features,
        "importance": model.feature_importances_,
    }).sort_values(
        "importance",
        ascending=False,
    )

    print(
        importance.to_string(
            index=False
        )
    )


if __name__ == "__main__":
    main()