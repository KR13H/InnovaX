TENNIS_DRILLS = {
    "movement_visibility": [
        {
            "id": "camera_position_check",
            "name": "Full-Body Movement Capture",
            "sets": 1,
            "reps": 1,
            "duration_minutes": 5,
            "description": (
                "Position the camera so the full body "
                "remains visible throughout the drill."
            ),
        }
    ],

    "stroke_recognition": [
        {
            "id": "controlled_stroke_repetitions",
            "name": "Controlled Stroke Repetitions",
            "sets": 4,
            "reps": 8,
            "duration_minutes": 15,
            "description": (
                "Perform clear forehand and backhand "
                "repetitions with consistent setup "
                "and follow-through."
            ),
        }
    ],

    "ready_position": [
        {
            "id": "ready_split_step",
            "name": "Ready Position and Split-Step Drill",
            "sets": 4,
            "reps": 10,
            "duration_minutes": 12,
            "description": (
                "Return to an athletic ready position "
                "after each simulated stroke and use "
                "a controlled split step."
            ),
        },
        {
            "id": "recover_to_center",
            "name": "Stroke and Recover Drill",
            "sets": 4,
            "reps": 8,
            "duration_minutes": 12,
            "description": (
                "Hit or shadow a stroke and immediately "
                "recover into a balanced ready position."
            ),
        },
    ],

    "serve_mechanics": [
        {
            "id": "serve_motion_shadow",
            "name": "Shadow Serve Mechanics",
            "sets": 3,
            "reps": 10,
            "duration_minutes": 12,
            "description": (
                "Practice the complete service motion "
                "without maximum power, focusing on "
                "smooth sequencing."
            ),
        },
        {
            "id": "service_box_targets",
            "name": "Service Box Target Drill",
            "sets": 4,
            "reps": 6,
            "duration_minutes": 15,
            "description": (
                "Serve toward marked targets inside "
                "the service box while maintaining "
                "consistent mechanics."
            ),
        },
    ],

    "forehand_consistency": [
        {
            "id": "forehand_crosscourt",
            "name": "Forehand Cross-Court Repetitions",
            "sets": 4,
            "reps": 10,
            "duration_minutes": 15,
            "description": (
                "Repeat controlled cross-court forehands "
                "with consistent preparation and follow-through."
            ),
        },
        {
            "id": "forehand_shadow",
            "name": "Forehand Shadow Swing",
            "sets": 3,
            "reps": 12,
            "duration_minutes": 10,
            "description": (
                "Practice repeatable forehand mechanics "
                "without the ball before increasing pace."
            ),
        },
    ],

    "backhand_consistency": [
        {
            "id": "backhand_crosscourt",
            "name": "Backhand Cross-Court Repetitions",
            "sets": 4,
            "reps": 10,
            "duration_minutes": 15,
            "description": (
                "Repeat controlled cross-court backhands "
                "with consistent preparation and recovery."
            ),
        },
        {
            "id": "backhand_shadow",
            "name": "Backhand Shadow Swing",
            "sets": 3,
            "reps": 12,
            "duration_minutes": 10,
            "description": (
                "Practice smooth backhand sequencing "
                "and balanced follow-through."
            ),
        },
    ],

    "upper_body_balance": [
        {
            "id": "two_side_shadow_swings",
            "name": "Balanced Shadow Swing Drill",
            "sets": 3,
            "reps": 10,
            "duration_minutes": 10,
            "description": (
                "Practice forehand and backhand movements "
                "with controlled shoulder and elbow positioning."
            ),
        },
        {
            "id": "slow_stroke_control",
            "name": "Slow Stroke Control Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 10,
            "description": (
                "Perform strokes at reduced speed to "
                "maintain controlled upper-body positioning."
            ),
        },
    ],

    "lower_body_balance": [
        {
            "id": "split_step_balance",
            "name": "Split-Step Balance Drill",
            "sets": 4,
            "reps": 10,
            "duration_minutes": 12,
            "description": (
                "Focus on balanced knee flexion and "
                "stable landing during the split step."
            ),
        },
        {
            "id": "lateral_recovery",
            "name": "Lateral Recovery Drill",
            "sets": 4,
            "reps": 8,
            "duration_minutes": 12,
            "description": (
                "Move laterally, simulate a stroke, "
                "then recover while keeping the lower body balanced."
            ),
        },
    ],
}


def get_drills_for_issue(
    issue: str,
):
    return TENNIS_DRILLS.get(
        issue,
        [],
    )