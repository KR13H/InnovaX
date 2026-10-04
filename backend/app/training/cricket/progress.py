from typing import Any, Dict, List


NUMERIC_METRICS = {
    "torso_lean_deg": {
        "direction": "lower",
        "path": ["pose", "biomechanics", "release", "torso_lean_deg"],
    },
    "bowling_elbow_angle_deg": {
        "direction": "higher",
        "path": ["pose", "biomechanics", "release", "bowling_elbow_angle_deg"],
    },
    "hip_shoulder_separation_deg": {
        "direction": "higher",
        "path": ["pose", "biomechanics", "ffc", "hip_shoulder_separation_deg"],
    },
    "back_knee_angle_deg": {
        "direction": "range",
        "ideal_min": 120,
        "ideal_max": 165,
        "path": ["pose", "biomechanics", "bfc", "back_knee_angle_deg"],
    },
    "speed_kmh": {
        "direction": "higher",
        "path": ["ball", "speed_kmh"],
    },
}


def get_nested(data: Dict[str, Any], path: List[str]):
    current = data

    for key in path:
        if not isinstance(current, dict):
            return None

        current = current.get(key)

        if current is None:
            return None

    return current


def distance_from_range(value, minimum, maximum):
    if minimum <= value <= maximum:
        return 0

    if value < minimum:
        return minimum - value

    return value - maximum


def compare_numeric_metric(
    name: str,
    previous: float,
    current: float,
    rule: Dict[str, Any],
):
    direction = rule["direction"]

    if direction == "higher":
        if current > previous:
            status = "improved"
        elif current < previous:
            status = "worsened"
        else:
            status = "unchanged"

    elif direction == "lower":
        if current < previous:
            status = "improved"
        elif current > previous:
            status = "worsened"
        else:
            status = "unchanged"

    elif direction == "range":
        previous_distance = distance_from_range(
            previous,
            rule["ideal_min"],
            rule["ideal_max"],
        )

        current_distance = distance_from_range(
            current,
            rule["ideal_min"],
            rule["ideal_max"],
        )

        if current_distance < previous_distance:
            status = "improved"
        elif current_distance > previous_distance:
            status = "worsened"
        else:
            status = "unchanged"

    else:
        status = "unchanged"

    return {
        "metric": name,
        "previous": previous,
        "current": current,
        "change": round(current - previous, 2),
        "status": status,
    }


def compare_cricket_sessions(
    previous_analysis: Dict[str, Any],
    current_analysis: Dict[str, Any],
):
    results = []

    for metric_name, rule in NUMERIC_METRICS.items():
        previous_value = get_nested(
            previous_analysis,
            rule["path"],
        )

        current_value = get_nested(
            current_analysis,
            rule["path"],
        )

        if previous_value is None or current_value is None:
            continue

        results.append(
            compare_numeric_metric(
                metric_name,
                float(previous_value),
                float(current_value),
                rule,
            )
        )

    previous_line = get_nested(
        previous_analysis,
        ["ball", "line"],
    )

    current_line = get_nested(
        current_analysis,
        ["ball", "line"],
    )

    if previous_line is not None and current_line is not None:
        results.append(
            {
                "metric": "line",
                "previous": previous_line,
                "current": current_line,
                "status": (
                    "unchanged"
                    if previous_line == current_line
                    else "changed"
                ),
            }
        )

    previous_length = get_nested(
        previous_analysis,
        ["ball", "length"],
    )

    current_length = get_nested(
        current_analysis,
        ["ball", "length"],
    )

    if previous_length is not None and current_length is not None:
        results.append(
            {
                "metric": "length",
                "previous": previous_length,
                "current": current_length,
                "status": (
                    "unchanged"
                    if previous_length == current_length
                    else "changed"
                ),
            }
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
        "other_changes": [
            item
            for item in results
            if item["status"] in {"changed", "unchanged"}
        ],
    }