from pathlib import Path
import math

import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_DATA_DIR = (
    BASE_DIR
    / "data"
    / "raw"
    / "markless"
    / "03_markerless_data"
)

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# ACTION LABEL NORMALIZATION
# ============================================================

ACTION_MAP = {
    "walk2": "slow_walk",
    "慢走": "slow_walk",

    "walk5": "fast_walk",
    "快走": "fast_walk",

    "walk8": "jog",
    "慢跑": "jog",
}


# ============================================================
# COCO KEYPOINT IDS
# ============================================================

LEFT_SHOULDER = 5
RIGHT_SHOULDER = 6

LEFT_HIP = 11
RIGHT_HIP = 12

LEFT_KNEE = 13
RIGHT_KNEE = 14

LEFT_ANKLE = 15
RIGHT_ANKLE = 16


# ============================================================
# BIOMECHANICS HELPERS
# ============================================================

def calculate_angle(a, b, c):
    """
    Calculate angle ABC in degrees.

    b is the joint where the angle is measured.
    """

    ba = (
        a[0] - b[0],
        a[1] - b[1],
    )

    bc = (
        c[0] - b[0],
        c[1] - b[1],
    )

    dot = (
        ba[0] * bc[0]
        + ba[1] * bc[1]
    )

    mag_ba = math.hypot(*ba)
    mag_bc = math.hypot(*bc)

    if mag_ba == 0 or mag_bc == 0:
        return None

    cosine = dot / (mag_ba * mag_bc)

    cosine = max(
        -1.0,
        min(1.0, cosine),
    )

    return math.degrees(
        math.acos(cosine)
    )


def calculate_torso_lean(shoulder, hip):
    """
    Calculate torso lean relative to vertical.

    0 degrees = vertical torso.

    NOTE:
    This measures lean magnitude only, not whether
    the athlete is leaning forward or backward.
    """

    dx = shoulder[0] - hip[0]
    dy = shoulder[1] - hip[1]

    if dx == 0 and dy == 0:
        return None

    return math.degrees(
        math.atan2(
            abs(dx),
            abs(dy),
        )
    )


def calculate_distance(a, b):
    """
    Calculate 2D Euclidean distance.
    """

    return math.hypot(
        a[0] - b[0],
        a[1] - b[1],
    )


def get_point(frame_data, keypoint_id):
    """
    Extract one keypoint from a frame.

    Returns:
        (x, y)

    Returns None when:
        - keypoint does not exist
        - confidence is below 0.5
    """

    row = frame_data[
        frame_data["keypoint"] == keypoint_id
    ]

    if row.empty:
        return None

    row = row.iloc[0]

    if row["confidence"] < 0.5:
        return None

    return (
        float(row["x"]),
        float(row["y"]),
    )


# ============================================================
# PROCESS ONE CSV
# ============================================================

def process_csv(csv_path):

    df = pd.read_csv(csv_path)

    output_rows = []

    for frame_number, frame_data in df.groupby("frame"):

        # ----------------------------------------------------
        # GET KEYPOINTS
        # ----------------------------------------------------

        left_shoulder = get_point(
            frame_data,
            LEFT_SHOULDER,
        )

        right_shoulder = get_point(
            frame_data,
            RIGHT_SHOULDER,
        )

        left_hip = get_point(
            frame_data,
            LEFT_HIP,
        )

        right_hip = get_point(
            frame_data,
            RIGHT_HIP,
        )

        left_knee = get_point(
            frame_data,
            LEFT_KNEE,
        )

        right_knee = get_point(
            frame_data,
            RIGHT_KNEE,
        )

        left_ankle = get_point(
            frame_data,
            LEFT_ANKLE,
        )

        right_ankle = get_point(
            frame_data,
            RIGHT_ANKLE,
        )

        # ----------------------------------------------------
        # SKIP BAD FRAMES
        # ----------------------------------------------------

        required_points = [
            left_shoulder,
            right_shoulder,
            left_hip,
            right_hip,
            left_knee,
            right_knee,
            left_ankle,
            right_ankle,
        ]

        if not all(required_points):
            continue

        # ----------------------------------------------------
        # KNEE ANGLES
        # ----------------------------------------------------

        left_knee_angle = calculate_angle(
            left_hip,
            left_knee,
            left_ankle,
        )

        right_knee_angle = calculate_angle(
            right_hip,
            right_knee,
            right_ankle,
        )

        # ----------------------------------------------------
        # HIP ANGLES
        #
        # shoulder -> hip -> knee
        # angle measured at hip
        # ----------------------------------------------------

        left_hip_angle = calculate_angle(
            left_shoulder,
            left_hip,
            left_knee,
        )

        right_hip_angle = calculate_angle(
            right_shoulder,
            right_hip,
            right_knee,
        )

        # ----------------------------------------------------
        # TORSO LEAN
        # ----------------------------------------------------

        left_torso_lean = calculate_torso_lean(
            left_shoulder,
            left_hip,
        )

        right_torso_lean = calculate_torso_lean(
            right_shoulder,
            right_hip,
        )

        torso_lean = (
            left_torso_lean
            + right_torso_lean
        ) / 2.0

        # ----------------------------------------------------
        # BODY SCALE
        #
        # We use shoulder-to-hip length to normalize ankle
        # movement later. This helps reduce camera-distance
        # effects.
        # ----------------------------------------------------

        left_torso_length = calculate_distance(
            left_shoulder,
            left_hip,
        )

        right_torso_length = calculate_distance(
            right_shoulder,
            right_hip,
        )

        body_scale = (
            left_torso_length
            + right_torso_length
        ) / 2.0

        if body_scale <= 0:
            continue

        # ----------------------------------------------------
        # NORMALIZED ANKLE POSITIONS
        #
        # Coordinates are relative to the corresponding hip
        # and divided by torso length.
        #
        # This is much better than feeding raw pixel
        # coordinates into the ML model.
        # ----------------------------------------------------

        left_ankle_rel_x = (
            left_ankle[0] - left_hip[0]
        ) / body_scale

        left_ankle_rel_y = (
            left_ankle[1] - left_hip[1]
        ) / body_scale

        right_ankle_rel_x = (
            right_ankle[0] - right_hip[0]
        ) / body_scale

        right_ankle_rel_y = (
            right_ankle[1] - right_hip[1]
        ) / body_scale

        # ----------------------------------------------------
        # ORIGINAL METADATA
        # ----------------------------------------------------

        first_row = frame_data.iloc[0]

        raw_action = str(
            first_row["action_type"]
        ).strip()

        action_type = ACTION_MAP.get(
            raw_action,
            raw_action,
        )

        # ----------------------------------------------------
        # SAVE FRAME
        # ----------------------------------------------------

        output_rows.append({

            "subject_id":
                first_row["subject_id"],

            "view_type":
                first_row["view_type"],

            "action_type":
                action_type,

            "frame":
                frame_number,

            # Knee biomechanics
            "left_knee_angle":
                left_knee_angle,

            "right_knee_angle":
                right_knee_angle,

            # Hip biomechanics
            "left_hip_angle":
                left_hip_angle,

            "right_hip_angle":
                right_hip_angle,

            # Torso
            "left_torso_lean":
                left_torso_lean,

            "right_torso_lean":
                right_torso_lean,

            "torso_lean":
                torso_lean,

            # Normalization reference
            "body_scale":
                body_scale,

            # Normalized ankle positions
            "left_ankle_rel_x":
                left_ankle_rel_x,

            "left_ankle_rel_y":
                left_ankle_rel_y,

            "right_ankle_rel_x":
                right_ankle_rel_x,

            "right_ankle_rel_y":
                right_ankle_rel_y,
        })

    return output_rows


# ============================================================
# MAIN
# ============================================================

def main():

    all_rows = []

    csv_files = list(
        RAW_DATA_DIR.rglob("*.csv")
    )

    print(
        f"Found {len(csv_files)} CSV files."
    )

    for csv_path in csv_files:

        # Side-view only
        if (
            csv_path.parent.name.lower()
            != "side"
        ):
            continue

        # Walk_2km / Walk_5km / Walk_8km only
        if not (
            csv_path.name
            .lower()
            .startswith("walk")
        ):
            continue

        print(
            f"Processing: {csv_path}"
        )

        rows = process_csv(
            csv_path
        )

        all_rows.extend(
            rows
        )

    output_df = pd.DataFrame(
        all_rows
    )

    # --------------------------------------------------------
    # SANITY CHECK
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("V2 FRAME DATASET SUMMARY")
    print("=" * 60)

    print(
        f"Frames created: "
        f"{len(output_df)}"
    )

    if not output_df.empty:

        print()
        print("Actions:")

        print(
            output_df[
                "action_type"
            ].value_counts()
        )

        print()
        print("Missing values:")

        print(
            output_df
            .isna()
            .sum()
        )

        print()
        print("V2 feature statistics:")

        feature_columns = [
            "left_knee_angle",
            "right_knee_angle",
            "left_hip_angle",
            "right_hip_angle",
            "torso_lean",
            "left_ankle_rel_x",
            "left_ankle_rel_y",
            "right_ankle_rel_x",
            "right_ankle_rel_y",
        ]

        print(
            output_df[
                feature_columns
            ].describe()
        )

    # --------------------------------------------------------
    # SAVE V2
    # --------------------------------------------------------

    output_file = (
        OUTPUT_DIR
        / "running_frames_v2.csv"
    )

    output_df.to_csv(
        output_file,
        index=False,
    )

    print()
    print(
        f"Saved V2 dataset to: "
        f"{output_file}"
    )


if __name__ == "__main__":
    main()