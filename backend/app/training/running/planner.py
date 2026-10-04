from typing import Any, Dict, List

from .drills import get_drills_for_issue
from .evaluator import evaluate_running_analysis
from .priorities import rank_weaknesses


def build_focus_areas(
    priorities: List[Dict[str, Any]],
    max_focus_areas: int = 3,
):
    selected = []
    used = set()

    for item in priorities:
        issue = item["issue"]

        if issue in used:
            continue

        selected.append(item)
        used.add(issue)

        if len(selected) >= max_focus_areas:
            break

    return selected


def create_training_session(
    day: int,
    focus: Dict[str, Any],
):
    return {
        "day": day,
        "title": focus["label"],
        "focus": focus["issue"],
        "priority_score": focus[
            "priority_score"
        ],
        "source_metric": focus["metric"],
        "current_value": focus["value"],
        "severity": focus["severity"],

        "warmup": {
            "duration_minutes": 10,
            "activities": [
                "Easy jog",
                "Leg swings",
                "Hip mobility",
                "Dynamic calf mobility",
            ],
        },

        "drills": get_drills_for_issue(
            focus["issue"]
        ),

        "cooldown": {
            "duration_minutes": 5,
            "activities": [
                "Easy walking",
                "Calf stretch",
                "Hamstring stretch",
                "Hip flexor stretch",
            ],
        },
    }


def generate_running_training_plan(
    analysis: Dict[str, Any],
    athlete_id: int | str,
    days_per_week: int = 4,
):
    weaknesses = evaluate_running_analysis(
        analysis
    )

    priorities = rank_weaknesses(
        weaknesses
    )

    focus_areas = build_focus_areas(
        priorities
    )

    if not focus_areas:
        return {
            "athlete_id": athlete_id,
            "sport": "running",
            "status": "maintenance",
            "focus_areas": [],
            "sessions": [],
            "message": (
                "No major running weaknesses "
                "were detected."
            ),
        }

    sessions = []

    for day in range(
        1,
        days_per_week + 1,
    ):
        focus = focus_areas[
            (day - 1) % len(focus_areas)
        ]

        sessions.append(
            create_training_session(
                day,
                focus,
            )
        )

    return {
        "athlete_id": athlete_id,
        "sport": "running",
        "status": "active",

        "focus_areas": [
            {
                "issue": focus["issue"],
                "label": focus["label"],
                "metric": focus["metric"],
                "current_value": focus[
                    "value"
                ],
                "severity": focus[
                    "severity"
                ],
                "priority_score": focus[
                    "priority_score"
                ],
            }
            for focus in focus_areas
        ],

        "sessions": sessions,
    }