from typing import Any, Dict, List


def metrics_to_dict(
    metrics: List[Dict[str, Any]],
) -> Dict[str, Dict[str, Any]]:
    return {
        item["metric_name"]: item
        for item in metrics
        if "metric_name" in item
    }


def add_issue(
    weaknesses: List[Dict[str, Any]],
    metric_name: str,
    metric: Dict[str, Any] | None,
    issue: str,
    label: str,
    severity: str,
    deviation: float,
    performance_impact: int,
):
    if metric is None:
        return

    weaknesses.append(
        {
            "metric": metric_name,
            "value": metric.get("metric_value"),
            "unit": metric.get("unit"),
            "confidence": metric.get("confidence"),
            "issue": issue,
            "label": label,
            "severity": severity,
            "deviation": round(deviation, 3),
            "performance_impact": performance_impact,
        }
    )


def evaluate_running_analysis(
    analysis: Dict[str, Any],
) -> List[Dict[str, Any]]:
    weaknesses = []

    classification_confidence = analysis.get(
        "classification_confidence"
    )

    if (
        classification_confidence is not None
        and classification_confidence < 0.70
    ):
        weaknesses.append(
            {
                "metric": "classification_confidence",
                "value": classification_confidence,
                "unit": "ratio",
                "confidence": classification_confidence,
                "issue": "capture_quality",
                "label": "Running analysis quality",
                "severity": (
                    "high"
                    if classification_confidence < 0.50
                    else "medium"
                ),
                "deviation": round(
                    0.70 - classification_confidence,
                    3,
                ),
                "performance_impact": 1,
            }
        )

    metric_map = metrics_to_dict(
        analysis.get("metrics", [])
    )

    knee_symmetry = metric_map.get(
        "knee_rom_symmetry"
    )

    if knee_symmetry is not None:
        value = knee_symmetry["metric_value"]

        if value < 85:
            severity = (
                "high"
                if value < 65
                else "medium"
            )

            add_issue(
                weaknesses,
                "knee_rom_symmetry",
                knee_symmetry,
                "knee_symmetry",
                "Knee movement symmetry",
                severity,
                (85 - value) / 85,
                3,
            )

    hip_symmetry = metric_map.get(
        "hip_rom_symmetry"
    )

    if hip_symmetry is not None:
        value = hip_symmetry["metric_value"]

        if value < 85:
            severity = (
                "high"
                if value < 60
                else "medium"
            )

            add_issue(
                weaknesses,
                "hip_rom_symmetry",
                hip_symmetry,
                "hip_symmetry",
                "Hip movement symmetry",
                severity,
                (85 - value) / 85,
                3,
            )

    torso_lean = metric_map.get(
        "torso_lean_mean"
    )

    if torso_lean is not None:
        value = abs(
            torso_lean["metric_value"]
        )

        if value > 12:
            severity = (
                "high"
                if value > 20
                else "medium"
            )

            add_issue(
                weaknesses,
                "torso_lean_mean",
                torso_lean,
                "torso_posture",
                "Running torso posture",
                severity,
                (value - 12) / 12,
                2,
            )

    torso_variability = metric_map.get(
        "torso_lean_std"
    )

    if torso_variability is not None:
        value = torso_variability[
            "metric_value"
        ]

        if value > 4:
            severity = (
                "high"
                if value > 7
                else "medium"
            )

            add_issue(
                weaknesses,
                "torso_lean_std",
                torso_variability,
                "torso_stability",
                "Torso stability",
                severity,
                (value - 4) / 4,
                2,
            )

    left_ankle = metric_map.get(
        "left_ankle_x_range"
    )

    right_ankle = metric_map.get(
        "right_ankle_x_range"
    )

    if (
        left_ankle is not None
        and right_ankle is not None
    ):
        left_value = left_ankle[
            "metric_value"
        ]

        right_value = right_ankle[
            "metric_value"
        ]

        larger = max(
            abs(left_value),
            abs(right_value),
            0.001,
        )

        asymmetry = (
            abs(left_value - right_value)
            / larger
        )

        if asymmetry > 0.15:
            weaknesses.append(
                {
                    "metric": "ankle_x_range_asymmetry",
                    "value": round(
                        asymmetry * 100,
                        2,
                    ),
                    "unit": "percent",
                    "confidence": min(
                        left_ankle.get(
                            "confidence",
                            1,
                        ),
                        right_ankle.get(
                            "confidence",
                            1,
                        ),
                    ),
                    "issue": "ankle_symmetry",
                    "label": "Ankle movement symmetry",
                    "severity": (
                        "high"
                        if asymmetry > 0.30
                        else "medium"
                    ),
                    "deviation": round(
                        asymmetry,
                        3,
                    ),
                    "performance_impact": 2,
                }
            )

    return weaknesses