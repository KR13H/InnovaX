from pathlib import Path

import pandas as pd
from scipy.signal import find_peaks


BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_frames_v2.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "running_strides_v2.csv"
)


def calculate_symmetry(left_value, right_value):
    """
    Return left/right similarity as a percentage.

    100 = identical.
    """

    average = (left_value + right_value) / 2

    if average <= 0:
        return 100.0

    symmetry = (
        1
        - abs(left_value - right_value) / average
    ) * 100

    return max(0.0, min(100.0, symmetry))


def extract_strides(group):

    group = group.sort_values("frame").copy()

    # ========================================================
    # SMOOTH SIGNALS
    # ========================================================

    group["left_knee_smooth"] = (
        group["left_knee_angle"]
        .rolling(
            window=5,
            center=True,
            min_periods=1,
        )
        .mean()
    )

    group["right_knee_smooth"] = (
        group["right_knee_angle"]
        .rolling(
            window=5,
            center=True,
            min_periods=1,
        )
        .mean()
    )

    group["left_hip_smooth"] = (
        group["left_hip_angle"]
        .rolling(
            window=5,
            center=True,
            min_periods=1,
        )
        .mean()
    )

    group["right_hip_smooth"] = (
        group["right_hip_angle"]
        .rolling(
            window=5,
            center=True,
            min_periods=1,
        )
        .mean()
    )

    group["torso_smooth"] = (
        group["torso_lean"]
        .rolling(
            window=5,
            center=True,
            min_periods=1,
        )
        .mean()
    )

    # ========================================================
    # DETECT GAIT EVENTS
    #
    # Knee-flexion minima are used as an approximate gait
    # event. This is a heuristic, not true heel-strike
    # detection.
    # ========================================================

    left_events, _ = find_peaks(
        -group["left_knee_smooth"].to_numpy(),
        distance=10,
        prominence=5,
    )

    strides = []

    for i in range(len(left_events) - 1):

        start = left_events[i]
        end = left_events[i + 1]

        stride = group.iloc[
            start:end + 1
        ].copy()

        if len(stride) < 10:
            continue

        # ====================================================
        # KNEE FEATURES
        # ====================================================

        left_knee_min = (
            stride["left_knee_smooth"].min()
        )

        left_knee_max = (
            stride["left_knee_smooth"].max()
        )

        right_knee_min = (
            stride["right_knee_smooth"].min()
        )

        right_knee_max = (
            stride["right_knee_smooth"].max()
        )

        left_knee_rom = (
            left_knee_max - left_knee_min
        )

        right_knee_rom = (
            right_knee_max - right_knee_min
        )

        knee_symmetry = calculate_symmetry(
            left_knee_rom,
            right_knee_rom,
        )

        # ====================================================
        # HIP FEATURES
        # ====================================================

        left_hip_min = (
            stride["left_hip_smooth"].min()
        )

        left_hip_max = (
            stride["left_hip_smooth"].max()
        )

        right_hip_min = (
            stride["right_hip_smooth"].min()
        )

        right_hip_max = (
            stride["right_hip_smooth"].max()
        )

        left_hip_rom = (
            left_hip_max - left_hip_min
        )

        right_hip_rom = (
            right_hip_max - right_hip_min
        )

        hip_symmetry = calculate_symmetry(
            left_hip_rom,
            right_hip_rom,
        )

        # ====================================================
        # TORSO FEATURES
        # ====================================================

        torso_lean_mean = (
            stride["torso_smooth"].mean()
        )

        torso_lean_max = (
            stride["torso_smooth"].max()
        )

        # Standard deviation = how much torso lean changes
        # during the stride.
        torso_lean_std = (
            stride["torso_smooth"].std()
        )

        # ====================================================
        # ANKLE MOVEMENT
        #
        # These coordinates are already normalized relative
        # to the hip/body scale.
        # ====================================================

        left_ankle_x_range = (
            stride["left_ankle_rel_x"].max()
            - stride["left_ankle_rel_x"].min()
        )

        left_ankle_y_range = (
            stride["left_ankle_rel_y"].max()
            - stride["left_ankle_rel_y"].min()
        )

        right_ankle_x_range = (
            stride["right_ankle_rel_x"].max()
            - stride["right_ankle_rel_x"].min()
        )

        right_ankle_y_range = (
            stride["right_ankle_rel_y"].max()
            - stride["right_ankle_rel_y"].min()
        )

        ankle_x_symmetry = calculate_symmetry(
            left_ankle_x_range,
            right_ankle_x_range,
        )

        ankle_y_symmetry = calculate_symmetry(
            left_ankle_y_range,
            right_ankle_y_range,
        )

        first = stride.iloc[0]

        # ====================================================
        # SAVE STRIDE
        # ====================================================

        strides.append({

            "subject_id":
                first["subject_id"],

            "action_type":
                first["action_type"],

            "stride_number":
                i,

            # Timing
            "stride_frames":
                len(stride),

            # Knee
            "left_min_knee_angle":
                round(left_knee_min, 3),

            "left_max_knee_angle":
                round(left_knee_max, 3),

            "left_knee_rom":
                round(left_knee_rom, 3),

            "right_min_knee_angle":
                round(right_knee_min, 3),

            "right_max_knee_angle":
                round(right_knee_max, 3),

            "right_knee_rom":
                round(right_knee_rom, 3),

            "knee_rom_symmetry":
                round(knee_symmetry, 3),

            # Hip
            "left_min_hip_angle":
                round(left_hip_min, 3),

            "left_max_hip_angle":
                round(left_hip_max, 3),

            "left_hip_rom":
                round(left_hip_rom, 3),

            "right_min_hip_angle":
                round(right_hip_min, 3),

            "right_max_hip_angle":
                round(right_hip_max, 3),

            "right_hip_rom":
                round(right_hip_rom, 3),

            "hip_rom_symmetry":
                round(hip_symmetry, 3),

            # Torso
            "torso_lean_mean":
                round(torso_lean_mean, 3),

            "torso_lean_max":
                round(torso_lean_max, 3),

            "torso_lean_std":
                round(torso_lean_std, 3),

            # Ankle
            "left_ankle_x_range":
                round(left_ankle_x_range, 4),

            "left_ankle_y_range":
                round(left_ankle_y_range, 4),

            "right_ankle_x_range":
                round(right_ankle_x_range, 4),

            "right_ankle_y_range":
                round(right_ankle_y_range, 4),

            "ankle_x_symmetry":
                round(ankle_x_symmetry, 3),

            "ankle_y_symmetry":
                round(ankle_y_symmetry, 3),
        })

    return strides


def main():

    df = pd.read_csv(INPUT_FILE)

    print(
        f"Loaded {len(df)} V2 frames."
    )

    all_strides = []

    groups = df.groupby(
        [
            "subject_id",
            "view_type",
            "action_type",
        ]
    )

    for (
        subject,
        view,
        action,
    ), group in groups:

        print(
            f"Subject {subject} | "
            f"{action} | "
            f"{len(group)} frames"
        )

        strides = extract_strides(
            group
        )

        all_strides.extend(
            strides
        )

    stride_df = pd.DataFrame(
        all_strides
    )

    stride_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print()
    print("=" * 60)
    print("V2 STRIDE EXTRACTION COMPLETE")
    print("=" * 60)

    print(
        f"Total V2 strides: "
        f"{len(stride_df)}"
    )

    if not stride_df.empty:

        print()
        print("Strides by action:")

        print(
            stride_df[
                "action_type"
            ].value_counts()
        )

        print()
        print("Missing values:")

        print(
            stride_df
            .isna()
            .sum()
        )

        print()
        print("V2 feature statistics:")

        important_features = [
            "stride_frames",
            "left_knee_rom",
            "right_knee_rom",
            "knee_rom_symmetry",
            "left_hip_rom",
            "right_hip_rom",
            "hip_rom_symmetry",
            "torso_lean_mean",
            "torso_lean_std",
            "left_ankle_x_range",
            "right_ankle_x_range",
            "ankle_x_symmetry",
        ]

        print(
            stride_df[
                important_features
            ].describe()
        )

    print()
    print(
        f"Saved V2 strides to: "
        f"{OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()