from typing import Any, Dict, List


def metrics_to_dict(
    metrics: List[Dict[str, Any]],
):
    return {
        item["metric_name"]: item
        for item in metrics
        if "metric_name" in item
    }


def compare_metric(
    metric: str,
    previous: float,
    current: float,
    higher_is_better: bool,
):
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
            current - previous,
            3,
        ),
        "status": status,
    }


def compare_running_sessions(
    previous_analysis: Dict[str, Any],
    current_analysis: Dict[str, Any],
):
    previous = metrics_to_dict(
        previous_analysis.get(
            "metrics",
            [],
        )
    )

    current = metrics_to_dict(
        current_analysis.get(
            "metrics",
            [],
        )
    )

    results = []

    higher_better = [
        "knee_rom_symmetry",
        "hip_rom_symmetry",
    ]

    lower_better = [
        "torso_lean_std",
    ]

    for metric in higher_better:
        if metric not in previous or metric not in current:
            continue

        results.append(
            compare_metric(
                metric,
                previous[metric][
                    "metric_value"
                ],
                current[metric][
                    "metric_value"
                ],
                True,
            )
        )

    for metric in lower_better:
        if metric not in previous or metric not in current:
            continue

        results.append(
            compare_metric(
                metric,
                previous[metric][
                    "metric_value"
                ],
                current[metric][
                    "metric_value"
                ],
                False,
            )
        )

    def ankle_asymmetry(
        data: Dict[str, Dict[str, Any]],
    ):
        left = data.get(
            "left_ankle_x_range"
        )

        right = data.get(
            "right_ankle_x_range"
        )

        if left is None or right is None:
            return None

        left_value = left["metric_value"]
        right_value = right["metric_value"]

        larger = max(
            abs(left_value),
            abs(right_value),
            0.001,
        )

        return (
            abs(left_value - right_value)
            / larger
        )

    previous_ankle = ankle_asymmetry(
        previous
    )

    current_ankle = ankle_asymmetry(
        current
    )

    if (
        previous_ankle is not None
        and current_ankle is not None
    ):
        results.append(
            compare_metric(
                "ankle_x_range_asymmetry",
                previous_ankle,
                current_ankle,
                False,
            )
        )

    return {
        "improvements": [
            item
            for item in results
            if item["status"]
            == "improved"
        ],

        "regressions": [
            item
            for item in results
            if item["status"]
            == "worsened"
        ],

        "unchanged": [
            item
            for item in results
            if item["status"]
            == "unchanged"
        ],
    }