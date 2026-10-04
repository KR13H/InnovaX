import math
from collections.abc import Iterable, Mapping
from numbers import Real
from typing import Any


_ANGLE_KEYS = (
    "right_elbow_angle",
    "left_elbow_angle",
    "right_knee_angle",
    "left_knee_angle",
)
_ZERO_CONSISTENCY_STANDARD_DEVIATION = 30.0


def calculate_basketball_consistency(
    frame_results: Iterable[Mapping[str, Any]],
) -> int:
    """Return a bounded heuristic consistency score for basketball angles."""
    frame_results = list(frame_results)
    standard_deviations = []

    for key in _ANGLE_KEYS:
        values = [
            value
            for frame_result in frame_results
            if isinstance(value := frame_result.get(key), Real)
            and not isinstance(value, bool)
            and math.isfinite(value)
        ]
        if len(values) >= 2:
            standard_deviations.append(_standard_deviation(values))

    if not standard_deviations:
        return 0

    average_standard_deviation = sum(standard_deviations) / len(standard_deviations)
    score = 100 * (
        1 - average_standard_deviation / _ZERO_CONSISTENCY_STANDARD_DEVIATION
    )
    return round(max(0.0, min(100.0, score)))


def _standard_deviation(values: list[Real]) -> float:
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / len(values)
    return math.sqrt(variance)
