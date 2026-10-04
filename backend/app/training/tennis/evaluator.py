from typing import Any, Dict, List


def evaluate_tennis_analysis(
    analysis: Dict[str, Any],
) -> List[Dict[str, Any]]:
    weaknesses = []

    pose_detection = analysis.get(
        "pose_detection_percent"
    )

    if pose_detection is not None and pose_detection < 75:
        weaknesses.append(
            {
                "metric": "pose_detection_percent",
                "value": pose_detection,
                "issue": "movement_visibility",
                "label": "Movement visibility",
                "severity": (
                    "high"
                    if pose_detection < 50
                    else "medium"
                ),
                "deviation": round(
                    (75 - pose_detection) / 75,
                    3,
                ),
                "performance_impact": 1,
            }
        )

    percentages = analysis.get(
        "pose_frame_percentages",
        {},
    )

    unknown = percentages.get("unknown")

    if unknown is not None and unknown > 60:
        weaknesses.append(
            {
                "metric": "unknown_pose_percent",
                "value": unknown,
                "issue": "stroke_recognition",
                "label": "Stroke recognition consistency",
                "severity": (
                    "high"
                    if unknown > 80
                    else "medium"
                ),
                "deviation": round(
                    unknown / 100,
                    3,
                ),
                "performance_impact": 2,
            }
        )

    ready = percentages.get("ready_position")

    if ready is not None and ready < 8:
        weaknesses.append(
            {
                "metric": "ready_position_percent",
                "value": ready,
                "issue": "ready_position",
                "label": "Ready position",
                "severity": "medium",
                "deviation": round(
                    (8 - ready) / 8,
                    3,
                ),
                "performance_impact": 3,
            }
        )

    serve = percentages.get("serve")

    if serve is not None and serve < 3:
        weaknesses.append(
            {
                "metric": "serve_percent",
                "value": serve,
                "issue": "serve_mechanics",
                "label": "Serve mechanics",
                "severity": "medium",
                "deviation": round(
                    (3 - serve) / 3,
                    3,
                ),
                "performance_impact": 3,
            }
        )

    forehand = percentages.get("forehand")

    if forehand is not None and forehand < 3:
        weaknesses.append(
            {
                "metric": "forehand_percent",
                "value": forehand,
                "issue": "forehand_consistency",
                "label": "Forehand consistency",
                "severity": "medium",
                "deviation": round(
                    (3 - forehand) / 3,
                    3,
                ),
                "performance_impact": 3,
            }
        )

    backhand = percentages.get("backhand")

    if backhand is not None and backhand < 3:
        weaknesses.append(
            {
                "metric": "backhand_percent",
                "value": backhand,
                "issue": "backhand_consistency",
                "label": "Backhand consistency",
                "severity": "medium",
                "deviation": round(
                    (3 - backhand) / 3,
                    3,
                ),
                "performance_impact": 3,
            }
        )

    angles = analysis.get(
        "mean_joint_angles_degrees",
        {},
    )

    left_elbow = angles.get("left_elbow")
    right_elbow = angles.get("right_elbow")

    if (
        left_elbow is not None
        and right_elbow is not None
    ):
        elbow_difference = abs(
            left_elbow - right_elbow
        )

        if elbow_difference > 25:
            weaknesses.append(
                {
                    "metric": "elbow_angle_difference",
                    "value": round(
                        elbow_difference,
                        2,
                    ),
                    "issue": "upper_body_balance",
                    "label": "Upper-body balance",
                    "severity": (
                        "high"
                        if elbow_difference > 45
                        else "medium"
                    ),
                    "deviation": round(
                        elbow_difference / 180,
                        3,
                    ),
                    "performance_impact": 2,
                }
            )

    left_knee = angles.get("left_knee")
    right_knee = angles.get("right_knee")

    if (
        left_knee is not None
        and right_knee is not None
    ):
        knee_difference = abs(
            left_knee - right_knee
        )

        if knee_difference > 20:
            weaknesses.append(
                {
                    "metric": "knee_angle_difference",
                    "value": round(
                        knee_difference,
                        2,
                    ),
                    "issue": "lower_body_balance",
                    "label": "Lower-body balance",
                    "severity": (
                        "high"
                        if knee_difference > 40
                        else "medium"
                    ),
                    "deviation": round(
                        knee_difference / 180,
                        3,
                    ),
                    "performance_impact": 2,
                }
            )

    return weaknesses