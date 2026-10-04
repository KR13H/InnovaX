from typing import Any


def analyze_training(metrics: dict[str, Any]) -> dict[str, Any]:
    feedback = []
    drills = []
    scores = []

    knee_angles = [
        metrics.get("avg_left_knee_angle"),
        metrics.get("avg_right_knee_angle"),
    ]
    knee_angles = [x for x in knee_angles if x is not None]

    elbow_angles = [
        metrics.get("avg_left_elbow_angle"),
        metrics.get("avg_right_elbow_angle"),
    ]
    elbow_angles = [x for x in elbow_angles if x is not None]

    # Heuristic technique benchmarks for MVP.
    for angle in knee_angles:
        if angle >= 150:
            scores.append(100)
        else:
            scores.append(max(0, round((angle / 150) * 100)))

    for angle in elbow_angles:
        if 80 <= angle <= 120:
            scores.append(100)
        else:
            distance = min(abs(angle - 80), abs(angle - 120))
            scores.append(max(0, 100 - round(distance * 2)))

    if knee_angles and min(knee_angles) < 150:
        feedback.append("Work on stronger knee extension.")
        drills.append("3 x 10 controlled squat-to-jump reps")

    if elbow_angles and any(angle < 80 for angle in elbow_angles):
        feedback.append("Your elbow is too bent during the detected movement.")
        drills.append("3 x 10 controlled shooting-form reps")

    if elbow_angles and any(angle > 120 for angle in elbow_angles):
        feedback.append("Keep your elbow more controlled and closer to the target position.")
        drills.append("3 x 10 form-shooting reps")

    if not feedback:
        feedback.append("Your detected joint angles are within the current target ranges.")

    technique_score = round(sum(scores) / len(scores)) if scores else 0

    return {
        "technique_score": technique_score,
        "feedback": feedback,
        "drills": drills,
    }
