from pathlib import Path

import pandas as pd
from scipy.signal import find_peaks


BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = BASE_DIR / "data" / "processed" / "running_frames.csv"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "running_strides.csv"


def extract_strides(group):
    group = group.sort_values("frame").copy()

    # Smooth small frame-to-frame pose-estimation noise
    group["left_smooth"] = (
        group["left_knee_angle"]
        .rolling(window=5, center=True, min_periods=1)
        .mean()
    )

    group["right_smooth"] = (
        group["right_knee_angle"]
        .rolling(window=5, center=True, min_periods=1)
        .mean()
    )

    # Knee flexion corresponds to lower knee angles.
    # find_peaks works on maxima, so negate the signal.
    left_events, _ = find_peaks(
        -group["left_smooth"].to_numpy(),
        distance=10,
        prominence=5,
    )

    strides = []

    for i in range(len(left_events) - 1):
        start = left_events[i]
        end = left_events[i + 1]

        stride = group.iloc[start:end + 1]

        if len(stride) < 10:
            continue

        left_min = stride["left_smooth"].min()
        left_max = stride["left_smooth"].max()

        right_min = stride["right_smooth"].min()
        right_max = stride["right_smooth"].max()

        left_rom = left_max - left_min
        right_rom = right_max - right_min

        average_rom = (left_rom + right_rom) / 2

        if average_rom > 0:
            symmetry = (
                1 - abs(left_rom - right_rom) / average_rom
            ) * 100
        else:
            symmetry = 100

        first = stride.iloc[0]

        strides.append({
            "subject_id": first["subject_id"],
            "action_type": first["action_type"],
            "stride_number": i,

            "stride_frames": len(stride),

            "left_min_knee_angle": round(left_min, 2),
            "left_max_knee_angle": round(left_max, 2),
            "left_knee_rom": round(left_rom, 2),

            "right_min_knee_angle": round(right_min, 2),
            "right_max_knee_angle": round(right_max, 2),
            "right_knee_rom": round(right_rom, 2),

            "knee_rom_symmetry": round(symmetry, 2),
        })

    return strides


def main():
    df = pd.read_csv(INPUT_FILE)

    print(f"Loaded {len(df)} frames.")
    print()

    all_strides = []

    groups = df.groupby(
        ["subject_id", "action_type"]
    )

    for (subject, action), group in groups:
        print(
            f"Subject {subject} | "
            f"{action} | "
            f"{len(group)} frames"
        )

        strides = extract_strides(group)
        all_strides.extend(strides)

    stride_df = pd.DataFrame(all_strides)

    stride_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print()
    print("=" * 40)
    print("STRIDE EXTRACTION COMPLETE")
    print("=" * 40)

    print(f"Total strides: {len(stride_df)}")

    if not stride_df.empty:
        print()
        print("Strides by action:")
        print(stride_df["action_type"].value_counts())

        print()
        print("Feature statistics:")
        print(
            stride_df[
                [
                    "stride_frames",
                    "left_knee_rom",
                    "right_knee_rom",
                    "knee_rom_symmetry",
                ]
            ].describe()
        )

    print()
    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()