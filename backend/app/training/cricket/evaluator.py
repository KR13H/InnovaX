from typing import Any, Dict, List


def _severity_from_deviation(
    value: float,
    ideal_min: float,
    ideal_max: float,
):
    if ideal_min <= value <= ideal_max:
        return "none", 0.0

    if value < ideal_min:
        deviation = ideal_min - value
        base = max(abs(ideal_min), 1)
    else:
        deviation = value - ideal_max
        base = max(abs(ideal_max), 1)

    ratio = deviation / base

    if ratio >= 0.30:
        return "high", ratio
    elif ratio >= 0.15:
        return "medium", ratio

    return "low", ratio


def add_biomechanics_issue(
    weaknesses: List[Dict[str, Any]],
    metric: str,
    value: Any,
    issue: str,
    label: str,
    ideal_min: float,
    ideal_max: float,
    impact: int,
):
    if value is None:
        return

    severity, deviation = _severity_from_deviation(
        float(value),
        ideal_min,
        ideal_max,
    )

    if severity == "none":
        return

    weaknesses.append(
        {
            "metric": metric,
            "value": value,
            "issue": issue,
            "label": label,
            "severity": severity,
            "deviation": round(deviation, 3),
            "performance_impact": impact,
        }
    )


def evaluate_biomechanics(
    biomechanics: Dict[str, Any],
) -> List[Dict[str, Any]]:

    weaknesses = []

    bfc = biomechanics.get("bfc", {})
    ffc = biomechanics.get("ffc", {})
    release = biomechanics.get("release", {})

    add_biomechanics_issue(
        weaknesses,
        "back_knee_angle_deg",
        bfc.get("back_knee_angle_deg"),
        "back_leg_drive",
        "Back-leg drive",
        120,
        165,
        2,
    )

    add_biomechanics_issue(
        weaknesses,
        "front_knee_angle_deg",
        ffc.get("front_knee_angle_deg"),
        "front_leg_bracing",
        "Front-leg bracing",
        145,
        175,
        3,
    )

    add_biomechanics_issue(
        weaknesses,
        "delivery_stride_torso_ratio",
        ffc.get("delivery_stride_torso_ratio"),
        "delivery_stride",
        "Delivery stride",
        1.0,
        1.8,
        2,
    )

    add_biomechanics_issue(
        weaknesses,
        "front_foot_angle_deg",
        ffc.get("front_foot_angle_deg"),
        "front_foot_alignment",
        "Front-foot alignment",
        -25,
        25,
        2,
    )

    add_biomechanics_issue(
        weaknesses,
        "hip_shoulder_separation_deg",
        ffc.get("hip_shoulder_separation_deg"),
        "hip_shoulder_separation",
        "Hip-shoulder separation",
        20,
        60,
        3,
    )

    add_biomechanics_issue(
        weaknesses,
        "bowling_elbow_angle_deg",
        release.get("bowling_elbow_angle_deg"),
        "arm_extension",
        "Bowling-arm extension",
        150,
        180,
        2,
    )

    add_biomechanics_issue(
        weaknesses,
        "torso_lean_deg",
        release.get("torso_lean_deg"),
        "torso_stability",
        "Torso stability",
        -20,
        20,
        3,
    )

    add_biomechanics_issue(
        weaknesses,
        "arm_extension_torso_ratio",
        release.get("arm_extension_torso_ratio"),
        "arm_extension",
        "Arm extension",
        0.8,
        1.5,
        2,
    )

    return weaknesses


def evaluate_ball_metrics(
    ball: Dict[str, Any],
) -> List[Dict[str, Any]]:

    weaknesses = []

    line = ball.get("line")

    GOOD_LINES = {
        "center",
        "off_stump",
        "outside_off",
    }

    if line and line not in GOOD_LINES:
        weaknesses.append(
            {
                "metric": "line",
                "value": line,
                "issue": "line_control",
                "label": "Bowling line",
                "severity": "medium",
                "deviation": 0.5,
                "performance_impact": 3,
            }
        )

    length = ball.get("length")

    GOOD_LENGTHS = {
        "good_length",
        "full",
        "yorker",
    }

    if length and length not in GOOD_LENGTHS:
        severity = (
            "high"
            if length in {"very_short", "very_full"}
            else "medium"
        )

        weaknesses.append(
            {
                "metric": "length",
                "value": length,
                "issue": "length_control",
                "label": "Bowling length",
                "severity": severity,
                "deviation": 0.7 if severity == "high" else 0.4,
                "performance_impact": 3,
            }
        )

    speed = ball.get("speed_kmh")

    if speed is not None and speed < 100:
        weaknesses.append(
            {
                "metric": "speed_kmh",
                "value": speed,
                "issue": "bowling_pace",
                "label": "Bowling pace",
                "severity": (
                    "high"
                    if speed < 85
                    else "medium"
                ),
                "deviation": round((100 - speed) / 100, 3),
                "performance_impact": 3,
            }
        )

    return weaknesses


def evaluate_cricket_analysis(
    analysis: Dict[str, Any],
) -> List[Dict[str, Any]]:

    weaknesses = []

    pose = analysis.get("pose", {})

    biomechanics = pose.get(
        "biomechanics",
        {},
    )

    weaknesses.extend(
        evaluate_biomechanics(
            biomechanics
        )
    )

    ball = analysis.get(
        "ball",
        {},
    )

    weaknesses.extend(
        evaluate_ball_metrics(
            ball
        )
    )

    return weaknesses