from typing import Any, Dict


def compare_percentage_metric(
    metric: str,
    previous: float,
    current: float,
    higher_is_better: bool = True,
):
    change = current - previous

    if higher_is_better:
        if current > previous:
            status = "improved"
        elif current < previous:
            status = "worsened"
        else:
            status = "unchanged"
    else:
        if current < previous:
            status = "improved"
        elif current > previous:
            status = "worsened"
        else:
            status = "unchanged"

    return {
        "metric": metric,
        "previous": previous,
        "current": current,
        "change": round(
            change,
            2,
        ),
        "status": status,
    }


def compare_tennis_sessions(
    previous_analysis: Dict[str, Any],
    current_analysis: Dict[str, Any],
):
    results = []

    previous_detection = previous_analysis.get(
        "pose_detection_percent"
    )

    current_detection = current_analysis.get(
        "pose_detection_percent"
    )

    if (
        previous_detection is not None
        and current_detection is not None
    ):
        results.append(
            compare_percentage_metric(
                "pose_detection_percent",
                previous_detection,
                current_detection,
                higher_is_better=True,
            )
        )

    previous_percentages = previous_analysis.get(
        "pose_frame_percentages",
        {},
    )

    current_percentages = current_analysis.get(
        "pose_frame_percentages",
        {},
    )

    for metric in [
        "ready_position",
        "serve",
        "forehand",
        "backhand",
    ]:
        previous = previous_percentages.get(
            metric
        )

        current = current_percentages.get(
            metric
        )

        if (
            previous is not None
            and current is not None
        ):
            results.append(
                compare_percentage_metric(
                    metric,
                    previous,
                    current,
                    higher_is_better=True,
                )
            )

    previous_unknown = previous_percentages.get(
        "unknown"
    )

    current_unknown = current_percentages.get(
        "unknown"
    )

    if (
        previous_unknown is not None
        and current_unknown is not None
    ):
        results.append(
            compare_percentage_metric(
                "unknown",
                previous_unknown,
                current_unknown,
                higher_is_better=False,
            )
        )

    previous_angles = previous_analysis.get(
        "mean_joint_angles_degrees",
        {},
    )

    current_angles = current_analysis.get(
        "mean_joint_angles_degrees",
        {},
    )

    previous_elbows = None
    current_elbows = None

    if (
        previous_angles.get("left_elbow") is not None
        and previous_angles.get("right_elbow") is not None
    ):
        previous_elbows = abs(
            previous_angles["left_elbow"]
            - previous_angles["right_elbow"]
        )

    if (
        current_angles.get("left_elbow") is not None
        and current_angles.get("right_elbow") is not None
    ):
        current_elbows = abs(
            current_angles["left_elbow"]
            - current_angles["right_elbow"]
        )

    if (
        previous_elbows is not None
        and current_elbows is not None
    ):
        results.append(
            compare_percentage_metric(
                "elbow_angle_difference",
                previous_elbows,
                current_elbows,
                higher_is_better=False,
            )
        )

    previous_knees = None
    current_knees = None

    if (
        previous_angles.get("left_knee") is not None
        and previous_angles.get("right_knee") is not None
    ):
        previous_knees = abs(
            previous_angles["left_knee"]
            - previous_angles["right_knee"]
        )

    if (
        current_angles.get("left_knee") is not None
        and current_angles.get("right_knee") is not None
    ):
        current_knees = abs(
            current_angles["left_knee"]
            - current_angles["right_knee"]
        )

    if (
        previous_knees is not None
        and current_knees is not None
    ):
        results.append(
            compare_percentage_metric(
                "knee_angle_difference",
                previous_knees,
                current_knees,
                higher_is_better=False,
            )
        )

    return {
        "improvements": [
            item
            for item in results
            if item["status"] == "improved"
        ],

        "regressions": [
            item
            for item in results
            if item["status"] == "worsened"
        ],

        "unchanged": [
            item
            for item in results
            if item["status"] == "unchanged"
        ],
    }