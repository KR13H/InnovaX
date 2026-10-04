RUNNING_DRILLS = {
    "capture_quality": [
        {
            "id": "running_capture_setup",
            "name": "Running Capture Setup",
            "sets": 1,
            "reps": 1,
            "duration_minutes": 5,
            "description": (
                "Record from a stable side or rear-side "
                "angle with the full body visible."
            ),
        }
    ],

    "knee_symmetry": [
        {
            "id": "marching_drill",
            "name": "A-March Drill",
            "sets": 3,
            "reps": 20,
            "duration_minutes": 10,
            "description": (
                "Practice equal knee drive and controlled "
                "foot placement on both sides."
            ),
        },
        {
            "id": "a_skip",
            "name": "A-Skip Drill",
            "sets": 3,
            "reps": 20,
            "duration_minutes": 10,
            "description": (
                "Develop balanced knee lift, rhythm, "
                "and coordination."
            ),
        },
    ],

    "hip_symmetry": [
        {
            "id": "single_leg_march",
            "name": "Single-Leg March Control",
            "sets": 3,
            "reps": 10,
            "duration_minutes": 10,
            "description": (
                "Practice controlled hip flexion on each "
                "side while maintaining pelvis stability."
            ),
        },
        {
            "id": "walking_lunges",
            "name": "Walking Lunges",
            "sets": 3,
            "reps": 10,
            "duration_minutes": 12,
            "description": (
                "Build balanced hip control and lower-body "
                "strength through each side."
            ),
        },
    ],

    "torso_posture": [
        {
            "id": "posture_run",
            "name": "Tall Posture Running Drill",
            "sets": 4,
            "reps": 30,
            "duration_minutes": 12,
            "description": (
                "Run short controlled efforts while "
                "maintaining a tall and stable torso."
            ),
        }
    ],

    "torso_stability": [
        {
            "id": "controlled_strides",
            "name": "Controlled Strides",
            "sets": 4,
            "reps": 30,
            "duration_minutes": 12,
            "description": (
                "Perform short strides while minimizing "
                "excessive side-to-side torso movement."
            ),
        },
        {
            "id": "single_leg_balance",
            "name": "Single-Leg Balance",
            "sets": 3,
            "reps": 30,
            "duration_minutes": 8,
            "description": (
                "Improve trunk and hip stability while "
                "balancing on each leg."
            ),
        },
    ],

    "ankle_symmetry": [
        {
            "id": "ankling",
            "name": "Ankling Drill",
            "sets": 3,
            "reps": 20,
            "duration_minutes": 10,
            "description": (
                "Practice quick, symmetrical ankle motion "
                "and light ground contact."
            ),
        },
        {
            "id": "calf_raise_balance",
            "name": "Single-Leg Calf Raises",
            "sets": 3,
            "reps": 12,
            "duration_minutes": 10,
            "description": (
                "Develop balanced ankle strength and "
                "control on both sides."
            ),
        },
    ],
}


def get_drills_for_issue(
    issue: str,
):
    return RUNNING_DRILLS.get(
        issue,
        [],
    )