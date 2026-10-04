"""Basketball training plans.

The basketball pipeline (app/analyzers/basketball_training.py) already returns a technique
score, feedback and drill suggestions from the shooting-arm and knee angles. This turns those
into a structured week of workouts in the same shape as the tennis/cricket/running planners,
so the app can run them as guided sessions.
"""

import re
from typing import Any, Dict, List

# Metric names are basketball-specific so the frontend can infer a plan's sport from them.
FOCUS_AREAS: Dict[str, Dict[str, Any]] = {
    "knee_extension": {
        "label": "Leg drive",
        "metric": "basketball_knee_extension_deg",
        "drills": [
            {
                "id": "squat_to_jump",
                "name": "Squat-to-Jump",
                "sets": 3,
                "reps": 10,
                "duration_minutes": 8,
                "description": "Sink into a controlled squat, then drive up and fully extend your knees and hips at the top.",
            },
            {
                "id": "jump_stop_landing",
                "name": "Jump-Stop Landings",
                "sets": 3,
                "reps": 8,
                "duration_minutes": 6,
                "description": "Jump, land softly on both feet with knees over toes, then explode straight back up.",
            },
        ],
    },
    "elbow_too_bent": {
        "label": "Shooting elbow extension",
        "metric": "basketball_shooting_elbow_deg",
        "drills": [
            {
                "id": "form_shooting",
                "name": "Close-Range Form Shooting",
                "sets": 3,
                "reps": 10,
                "duration_minutes": 10,
                "description": "One hand, close to the rim. Finish every shot with a full arm extension and a held follow-through.",
            },
            {
                "id": "wall_shooting",
                "name": "Wall Shooting Reps",
                "sets": 3,
                "reps": 12,
                "duration_minutes": 6,
                "description": "Shoot against a wall from arm's length, focusing on extending the elbow straight up and out.",
            },
        ],
    },
    "elbow_too_open": {
        "label": "Shooting elbow control",
        "metric": "basketball_shooting_elbow_deg",
        "drills": [
            {
                "id": "elbow_in_form_shooting",
                "name": "Elbow-In Form Shooting",
                "sets": 3,
                "reps": 10,
                "duration_minutes": 10,
                "description": "Keep the shooting elbow under the ball and in line with the rim from set point to release.",
            },
            {
                "id": "set_point_shooting_holds",
                "name": "Set-Point Shooting Holds",
                "sets": 3,
                "reps": 8,
                "duration_minutes": 6,
                "description": "Bring the ball to your set point, hold for two seconds checking elbow alignment, then shoot.",
            },
        ],
    },
    "consistency": {
        "label": "Shooting consistency",
        "metric": "basketball_technique_score",
        "drills": [
            {
                "id": "free_throw_rhythm_shooting",
                "name": "Free-Throw Rhythm Shooting",
                "sets": 3,
                "reps": 10,
                "duration_minutes": 10,
                "description": "Same routine every shot: dribble, set, breathe, shoot. Track how many you make per set.",
            },
            {
                "id": "squat_to_jump",
                "name": "Squat-to-Jump",
                "sets": 3,
                "reps": 8,
                "duration_minutes": 6,
                "description": "Build the leg drive that powers your shot.",
            },
        ],
    },
}

WARMUP = {"duration_minutes": 8, "activities": ["Easy jog", "Dynamic leg swings", "Ball-handling warm-up", "Close-range form shots"]}
COOLDOWN = {"duration_minutes": 5, "activities": ["Easy walking", "Quad stretch", "Shoulder and triceps stretch", "Calf stretch"]}

SETS_REPS = re.compile(r"(\d+)\s*[x×]\s*(\d+)")


def _mean(values: List[float]) -> float | None:
    return round(sum(values) / len(values), 1) if values else None


def evaluate_basketball_analysis(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Weaknesses from the pipeline's metrics, using the same thresholds as its feedback."""
    metrics = analysis.get("metrics") or {}
    training = analysis.get("training") or {}
    suggested = training.get("drills") or []
    knees = [v for v in (metrics.get("avg_left_knee_angle"), metrics.get("avg_right_knee_angle")) if v is not None]
    elbows = [v for v in (metrics.get("avg_left_elbow_angle"), metrics.get("avg_right_elbow_angle")) if v is not None]

    found = []
    if knees and min(knees) < 150:
        gap = 150 - min(knees)
        found.append({"issue": "knee_extension", "value": round(min(knees), 1), "gap": gap, "hint": "squat"})
    if elbows and any(a < 80 for a in elbows):
        found.append({"issue": "elbow_too_bent", "value": round(min(elbows), 1), "gap": 80 - min(elbows), "hint": "shooting-form"})
    if elbows and any(a > 120 for a in elbows):
        found.append({"issue": "elbow_too_open", "value": round(max(elbows), 1), "gap": max(elbows) - 120, "hint": "form-shooting"})

    for f in found:
        f["severity"] = "high" if f["gap"] >= 25 else "medium" if f["gap"] >= 10 else "low"
        f["priority_score"] = round(min(100, 40 + f["gap"] * 2), 1)
        # Keep the pipeline's own sets × reps when it suggested this drill.
        for text in suggested:
            m = SETS_REPS.search(text)
            if m and f["hint"] in text:
                f["sets_reps"] = (int(m.group(1)), int(m.group(2)))
    return sorted(found, key=lambda f: -f["priority_score"])


def generate_basketball_training_plan(analysis: Dict[str, Any], athlete_id: int | str, days_per_week: int = 4):
    weaknesses = evaluate_basketball_analysis(analysis)
    if not weaknesses:
        # No angle problems: train consistency rather than returning an empty plan.
        score = (analysis.get("training") or {}).get("technique_score")
        weaknesses = [{"issue": "consistency", "value": score, "severity": "low", "priority_score": 30}]

    focus_areas = []
    for w in weaknesses:
        spec = FOCUS_AREAS[w["issue"]]
        drills = [dict(d) for d in spec["drills"]]
        if "sets_reps" in w:
            drills[0]["sets"], drills[0]["reps"] = w["sets_reps"]
        focus_areas.append({**w, "label": spec["label"], "metric": spec["metric"], "drills": drills})

    sessions = []
    for day in range(1, days_per_week + 1):
        focus = focus_areas[(day - 1) % len(focus_areas)]
        sessions.append(
            {
                "day": day,
                "title": focus["label"],
                "focus": focus["label"].lower(),
                "severity": focus["severity"],
                "priority_score": focus["priority_score"],
                "source_metric": focus["metric"],
                "current_value": focus["value"],
                "warmup": WARMUP,
                "drills": focus["drills"],
                "cooldown": COOLDOWN,
            }
        )

    return {
        "athlete_id": athlete_id,
        "sport": "basketball",
        "status": "active",
        "focus_areas": [
            {
                "issue": f["issue"],
                "label": f["label"],
                "metric": f["metric"],
                "current_value": f["value"],
                "severity": f["severity"],
                "priority_score": f["priority_score"],
            }
            for f in focus_areas
        ],
        "sessions": sessions,
    }
