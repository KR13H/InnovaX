from collections.abc import Mapping
from typing import Any

_ACTION_SCORES = {
    "Idle": 40,
    "Move": 65,
    "Dribble": 80,
    "Shoot": 95,
    "Sprint": 90,
}

def score_basketball_result(result: Mapping[str, Any]) -> dict[str, Any]:
    metrics = dict(result.get("metrics", {}))
    action_counts = metrics.get("action_counts", {})

    if not action_counts:
        return {
            "sport": "basketball",
            "session_score": 0,
            "metrics": metrics,
            "feedback": ["No basketball actions were detected."],
        }

    total_frames = sum(action_counts.values())

    weighted_score = sum(
        _ACTION_SCORES.get(action, 50) * count
        for action, count in action_counts.items()
    )

    session_score = round(weighted_score / total_frames)

    return {
        "sport": result.get("sport", "basketball"),
        "session_score": session_score,
        "metrics": metrics,
        "feedback": [
            f"Dominant detected action: {metrics.get('dominant_action')}."
        ],
    }
