from typing import Any, Dict, List


SEVERITY_SCORE = {
    "low": 1,
    "medium": 2,
    "high": 3,
}


def calculate_priority_score(
    weakness: Dict[str, Any],
) -> float:
    severity = SEVERITY_SCORE.get(
        weakness.get("severity", "low"),
        1,
    )

    impact = weakness.get(
        "performance_impact",
        1,
    )

    deviation = weakness.get(
        "deviation",
        0,
    )

    deviation_bonus = min(
        deviation * 3,
        3,
    )

    score = (
        severity * 2
        + impact * 2
        + deviation_bonus
    )

    return round(score, 2)


def rank_weaknesses(
    weaknesses: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    ranked = []

    for weakness in weaknesses:
        item = weakness.copy()

        item["priority_score"] = (
            calculate_priority_score(item)
        )

        ranked.append(item)

    ranked.sort(
        key=lambda x: x["priority_score"],
        reverse=True,
    )

    return ranked