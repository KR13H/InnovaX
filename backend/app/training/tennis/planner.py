from typing import Any, Dict, List

from .drills import get_drills_for_issue
from .evaluator import evaluate_tennis_analysis
from .priorities import rank_weaknesses


def build_focus_areas(
    priorities: List[Dict[str, Any]],
    max_focus_areas: int = 3,
):
    selected = []
    used_issues = set()

    for item in priorities:
        issue = item["issue"]

        if issue in used_issues:
            continue

        selected.append(item)
        used_issues.add(issue)

        if len(selected) >= max_focus_areas:
            break

    return selected


def create_training_session(
    day: int,
    focus: Dict[str, Any],
):
    drills = get_drills_for_issue(
        focus["issue"]
    )

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
                "Light jog",
                "Dynamic lower-body mobility",
                "Shoulder mobility",
                "Controlled shadow swings",
            ],
        },

        "drills": drills,

        "cooldown": {
            "duration_minutes": 5,
            "activities": [
                "Light walking",
                "Shoulder stretch",
                "Hip mobility",
                "Calf and hamstring stretch",
            ],
        },
    }


def generate_tennis_training_plan(
    analysis: Dict[str, Any],
    athlete_id: int | str,
    days_per_week: int = 4,
):
    weaknesses = evaluate_tennis_analysis(
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
            "sport": "tennis",
            "status": "maintenance",
            "focus_areas": [],
            "sessions": [],
            "message": (
                "No major tennis weaknesses "
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
        "sport": "tennis",
        "status": "active",

        "focus_areas": [
            {
                "issue": focus["issue"],
                "label": focus["label"],
                "metric": focus["metric"],
                "current_value": focus["value"],
                "severity": focus["severity"],
                "priority_score": focus[
                    "priority_score"
                ],
            }
            for focus in focus_areas
        ],

        "sessions": sessions,
    }