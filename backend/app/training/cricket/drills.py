CRICKET_DRILLS = {
    "front_leg_bracing": [
        {
            "id": "front_leg_brace",
            "name": "Front-Leg Brace Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 12,
            "description": (
                "Focus on landing firmly on the front leg "
                "and maintaining stability through release."
            ),
        },
        {
            "id": "single_step_bowling",
            "name": "Single-Step Bowling",
            "sets": 3,
            "reps": 6,
            "duration_minutes": 10,
            "description": (
                "Remove the full run-up and focus on the "
                "front-leg block and body position."
            ),
        },
    ],

    "back_leg_drive": [
        {
            "id": "back_leg_drive",
            "name": "Back-Leg Drive Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 10,
            "description": (
                "Drive strongly from the rear leg into "
                "the delivery stride."
            ),
        }
    ],

    "delivery_stride": [
        {
            "id": "stride_marker",
            "name": "Stride Marker Drill",
            "sets": 4,
            "reps": 6,
            "duration_minutes": 12,
            "description": (
                "Use ground markers to repeat a controlled "
                "and consistent delivery stride."
            ),
        }
    ],

    "front_foot_alignment": [
        {
            "id": "front_foot_marker",
            "name": "Front-Foot Alignment Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 10,
            "description": (
                "Use a landing marker to improve front-foot "
                "direction and alignment."
            ),
        }
    ],

    "hip_shoulder_separation": [
        {
            "id": "hip_shoulders",
            "name": "Hip-Shoulder Separation Drill",
            "sets": 3,
            "reps": 10,
            "duration_minutes": 12,
            "description": (
                "Practice initiating rotation through the "
                "hips before the shoulders."
            ),
        },
        {
            "id": "medicine_ball_rotation",
            "name": "Rotational Power Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 10,
            "description": (
                "Develop controlled rotational sequencing "
                "through the hips and torso."
            ),
        },
    ],

    "arm_extension": [
        {
            "id": "high_release",
            "name": "High Release Drill",
            "sets": 3,
            "reps": 8,
            "duration_minutes": 10,
            "description": (
                "Focus on full bowling-arm extension and "
                "a consistent release position."
            ),
        }
    ],

    "torso_stability": [
        {
            "id": "controlled_delivery",
            "name": "Controlled Delivery Drill",
            "sets": 3,
            "reps": 6,
            "duration_minutes": 10,
            "description": (
                "Bowl at reduced intensity while maintaining "
                "stable torso positioning."
            ),
        }
    ],

    "line_control": [
        {
            "id": "single_stump",
            "name": "Single-Stump Target Drill",
            "sets": 4,
            "reps": 6,
            "duration_minutes": 15,
            "description": (
                "Aim repeatedly at a single stump or narrow "
                "target channel."
            ),
        },
        {
            "id": "corridor_bowling",
            "name": "Corridor Bowling Drill",
            "sets": 4,
            "reps": 6,
            "duration_minutes": 15,
            "description": (
                "Bowl consistently inside a marked line "
                "outside off stump."
            ),
        },
    ],

    "length_control": [
        {
            "id": "length_zone",
            "name": "Length Zone Drill",
            "sets": 4,
            "reps": 6,
            "duration_minutes": 15,
            "description": (
                "Use marked pitch zones and score each delivery "
                "based on landing location."
            ),
        }
    ],

    "bowling_pace": [
        {
            "id": "progressive_pace",
            "name": "Progressive Pace Bowling",
            "sets": 4,
            "reps": 4,
            "duration_minutes": 15,
            "description": (
                "Increase bowling intensity progressively while "
                "maintaining technique and control."
            ),
        },
        {
            "id": "runup_acceleration",
            "name": "Run-Up Acceleration Drill",
            "sets": 4,
            "reps": 5,
            "duration_minutes": 10,
            "description": (
                "Practice smooth acceleration into the delivery "
                "stride without rushing."
            ),
        },
    ],
}


def get_drills_for_issue(issue: str):
    return CRICKET_DRILLS.get(issue, [])