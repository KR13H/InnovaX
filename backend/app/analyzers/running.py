from collections import Counter
from pathlib import Path
import math

import cv2
import joblib
import numpy as np
import pandas as pd
from scipy.signal import find_peaks

from app.vision.pose_estimator import YoloPoseEstimator


# ============================================================
# PATHS
# ============================================================

# running.py:
# backend/app/analyzers/running.py
#
# parents[0] = analyzers
# parents[1] = app
# parents[2] = backend
# parents[3] = project root / InnovaX

PROJECT_ROOT = Path(__file__).resolve().parents[3]

MODEL_PATH = (
    PROJECT_ROOT
    / "ml"
    / "running"
    / "models"
    / "running_classifier_v2.joblib"
)


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
# EXACT V2 FEATURE ORDER
# ============================================================

FEATURES = [
    "stride_frames",

    "left_min_knee_angle",
    "left_max_knee_angle",
    "left_knee_rom",

    "right_min_knee_angle",
    "right_max_knee_angle",
    "right_knee_rom",

    "knee_rom_symmetry",

    "left_min_hip_angle",
    "left_max_hip_angle",
    "left_hip_rom",

    "right_min_hip_angle",
    "right_max_hip_angle",
    "right_hip_rom",

    "hip_rom_symmetry",

    "torso_lean_mean",
    "torso_lean_max",
    "torso_lean_std",

    "left_ankle_x_range",
    "left_ankle_y_range",

    "right_ankle_x_range",
    "right_ankle_y_range",

    "ankle_x_symmetry",
    "ankle_y_symmetry",
]


# ============================================================
# HELPERS
# ============================================================

def calculate_angle(a, b, c):
    """
    Calculate angle ABC in degrees.
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
    Torso lean magnitude relative to vertical.

    0 degrees = vertical.

    This is magnitude only, matching V2 training.
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
    return math.hypot(
        a[0] - b[0],
        a[1] - b[1],
    )


def calculate_symmetry(left_value, right_value):
    """
    100 = perfectly symmetric.
    """

    average = (
        left_value + right_value
    ) / 2.0

    if average <= 0:
        return 100.0

    symmetry = (
        1.0
        - abs(left_value - right_value)
        / average
    ) * 100.0

    return max(
        0.0,
        min(100.0, symmetry),
    )


# ============================================================
# YOLO KEYPOINT EXTRACTION
# ============================================================

def get_keypoint(keypoints, keypoint_id, min_confidence=0.5):
    """
    Read one YOLO pose keypoint.

    Expected shape:
        [17, 3]

    columns:
        x, y, confidence
    """

    if keypoints is None:
        return None

    if keypoint_id >= len(keypoints):
        return None

    point = keypoints[keypoint_id]

    x = float(point[0])
    y = float(point[1])
    confidence = float(point[2])

    if confidence < min_confidence:
        return None

    return (x, y)


# ============================================================
# CONVERT ONE YOLO FRAME INTO V2 FRAME FEATURES
# ============================================================

def extract_frame_features(
    keypoints,
    frame_number,
):
    left_shoulder = get_keypoint(
        keypoints,
        LEFT_SHOULDER,
    )

    right_shoulder = get_keypoint(
        keypoints,
        RIGHT_SHOULDER,
    )

    left_hip = get_keypoint(
        keypoints,
        LEFT_HIP,
    )

    right_hip = get_keypoint(
        keypoints,
        RIGHT_HIP,
    )

    left_knee = get_keypoint(
        keypoints,
        LEFT_KNEE,
    )

    right_knee = get_keypoint(
        keypoints,
        RIGHT_KNEE,
    )

    left_ankle = get_keypoint(
        keypoints,
        LEFT_ANKLE,
    )

    right_ankle = get_keypoint(
        keypoints,
        RIGHT_ANKLE,
    )

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
        return None

    # --------------------------------------------------------
    # Knee angles
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Hip angles
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Torso
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Body normalization
    # --------------------------------------------------------

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
        return None

    # --------------------------------------------------------
    # Normalized ankle positions
    # --------------------------------------------------------

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

    return {
        "frame": frame_number,

        "left_knee_angle":
            left_knee_angle,

        "right_knee_angle":
            right_knee_angle,

        "left_hip_angle":
            left_hip_angle,

        "right_hip_angle":
            right_hip_angle,

        "torso_lean":
            torso_lean,

        "left_ankle_rel_x":
            left_ankle_rel_x,

        "left_ankle_rel_y":
            left_ankle_rel_y,

        "right_ankle_rel_x":
            right_ankle_rel_x,

        "right_ankle_rel_y":
            right_ankle_rel_y,
    }


# ============================================================
# FRAME DATA -> V2 STRIDES
# ============================================================

def extract_strides(frame_df):
    if frame_df.empty:
        return []

    group = (
        frame_df
        .sort_values("frame")
        .copy()
    )

    # --------------------------------------------------------
    # Same smoothing used during V2 dataset creation
    # --------------------------------------------------------

    for column in [
        "left_knee_angle",
        "right_knee_angle",
        "left_hip_angle",
        "right_hip_angle",
        "torso_lean",
    ]:
        group[f"{column}_smooth"] = (
            group[column]
            .rolling(
                window=5,
                center=True,
                min_periods=1,
            )
            .mean()
        )

    # --------------------------------------------------------
    # Same heuristic gait event detection as V2 training
    # --------------------------------------------------------

    left_events, _ = find_peaks(
        -group[
            "left_knee_angle_smooth"
        ].to_numpy(),
        distance=10,
        prominence=5,
    )

    strides = []

    for i in range(
        len(left_events) - 1
    ):
        start = left_events[i]
        end = left_events[i + 1]

        stride = group.iloc[
            start:end + 1
        ].copy()

        if len(stride) < 10:
            continue

        # ----------------------------------------------------
        # Knee
        # ----------------------------------------------------

        left_knee_min = stride[
            "left_knee_angle_smooth"
        ].min()

        left_knee_max = stride[
            "left_knee_angle_smooth"
        ].max()

        right_knee_min = stride[
            "right_knee_angle_smooth"
        ].min()

        right_knee_max = stride[
            "right_knee_angle_smooth"
        ].max()

        left_knee_rom = (
            left_knee_max
            - left_knee_min
        )

        right_knee_rom = (
            right_knee_max
            - right_knee_min
        )

        knee_symmetry = (
            calculate_symmetry(
                left_knee_rom,
                right_knee_rom,
            )
        )

        # ----------------------------------------------------
        # Hip
        # ----------------------------------------------------

        left_hip_min = stride[
            "left_hip_angle_smooth"
        ].min()

        left_hip_max = stride[
            "left_hip_angle_smooth"
        ].max()

        right_hip_min = stride[
            "right_hip_angle_smooth"
        ].min()

        right_hip_max = stride[
            "right_hip_angle_smooth"
        ].max()

        left_hip_rom = (
            left_hip_max
            - left_hip_min
        )

        right_hip_rom = (
            right_hip_max
            - right_hip_min
        )

        hip_symmetry = (
            calculate_symmetry(
                left_hip_rom,
                right_hip_rom,
            )
        )

        # ----------------------------------------------------
        # Torso
        # ----------------------------------------------------

        torso_lean_mean = stride[
            "torso_lean_smooth"
        ].mean()

        torso_lean_max = stride[
            "torso_lean_smooth"
        ].max()

        torso_lean_std = stride[
            "torso_lean_smooth"
        ].std()

        # ----------------------------------------------------
        # Ankle movement
        # ----------------------------------------------------

        left_ankle_x_range = (
            stride[
                "left_ankle_rel_x"
            ].max()
            -
            stride[
                "left_ankle_rel_x"
            ].min()
        )

        left_ankle_y_range = (
            stride[
                "left_ankle_rel_y"
            ].max()
            -
            stride[
                "left_ankle_rel_y"
            ].min()
        )

        right_ankle_x_range = (
            stride[
                "right_ankle_rel_x"
            ].max()
            -
            stride[
                "right_ankle_rel_x"
            ].min()
        )

        right_ankle_y_range = (
            stride[
                "right_ankle_rel_y"
            ].max()
            -
            stride[
                "right_ankle_rel_y"
            ].min()
        )

        ankle_x_symmetry = (
            calculate_symmetry(
                left_ankle_x_range,
                right_ankle_x_range,
            )
        )

        ankle_y_symmetry = (
            calculate_symmetry(
                left_ankle_y_range,
                right_ankle_y_range,
            )
        )

        # ----------------------------------------------------
        # EXACT SAME 24 FEATURES AS TRAINING
        # ----------------------------------------------------

        strides.append({
            "stride_frames":
                len(stride),

            "left_min_knee_angle":
                left_knee_min,

            "left_max_knee_angle":
                left_knee_max,

            "left_knee_rom":
                left_knee_rom,

            "right_min_knee_angle":
                right_knee_min,

            "right_max_knee_angle":
                right_knee_max,

            "right_knee_rom":
                right_knee_rom,

            "knee_rom_symmetry":
                knee_symmetry,

            "left_min_hip_angle":
                left_hip_min,

            "left_max_hip_angle":
                left_hip_max,

            "left_hip_rom":
                left_hip_rom,

            "right_min_hip_angle":
                right_hip_min,

            "right_max_hip_angle":
                right_hip_max,

            "right_hip_rom":
                right_hip_rom,

            "hip_rom_symmetry":
                hip_symmetry,

            "torso_lean_mean":
                torso_lean_mean,

            "torso_lean_max":
                torso_lean_max,

            "torso_lean_std":
                torso_lean_std,

            "left_ankle_x_range":
                left_ankle_x_range,

            "left_ankle_y_range":
                left_ankle_y_range,

            "right_ankle_x_range":
                right_ankle_x_range,

            "right_ankle_y_range":
                right_ankle_y_range,

            "ankle_x_symmetry":
                ankle_x_symmetry,

            "ankle_y_symmetry":
                ankle_y_symmetry,
        })

    return strides


# ============================================================
# MODEL LOADING
# ============================================================

def load_running_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Running V2 model not found: "
            f"{MODEL_PATH}"
        )

    saved = joblib.load(
        MODEL_PATH
    )

    # Our V2 training script saved:
    #
    # {
    #     "model": model,
    #     "features": FEATURES,
    #     "version": "v2"
    # }

    if isinstance(saved, dict):
        model = saved["model"]

        model_features = saved.get(
            "features",
            FEATURES,
        )

        return model, model_features

    # Fallback in case model was saved directly
    return saved, FEATURES


# ============================================================
# MAIN RUNNING ANALYZER
# ============================================================

def analyze_running_video(video_path):
    """
    Analyze one running video.

    Returns:
        {
            "running_type": ...,
            "classification_confidence": ...,
            "stride_count": ...,
            "metrics": [...]
        }
    """

    video_path = Path(video_path)

    if not video_path.exists():
        raise FileNotFoundError(
            f"Video not found: {video_path}"
        )

    # --------------------------------------------------------
    # Open video
    # --------------------------------------------------------

    cap = cv2.VideoCapture(
        str(video_path)
    )

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open video: "
            f"{video_path}"
        )

    pose_estimator = YoloPoseEstimator()

    frame_rows = []

    total_frames = 0
    usable_frames = 0

    try:
        while True:
            success, frame = cap.read()

            if not success:
                break

            total_frames += 1

            result = (
                pose_estimator
                .process_frame(frame)
            )

            if (
                result.keypoints is None
                or len(result.keypoints) == 0
            ):
                continue

            # ------------------------------------------------
            # Pick the most confident detected person
            # ------------------------------------------------

            if (
                result.boxes is not None
                and result.boxes.conf
                is not None
                and len(result.boxes.conf) > 0
            ):
                person_index = int(
                    result.boxes.conf.argmax()
                )
            else:
                person_index = 0

            keypoints_object = (
                result.keypoints[
                    person_index
                ]
            )

            xy = (
                keypoints_object
                .xy[0]
                .cpu()
                .numpy()
            )

            conf = (
                keypoints_object
                .conf[0]
                .cpu()
                .numpy()
            )

            keypoints = np.column_stack(
                (
                    xy[:, 0],
                    xy[:, 1],
                    conf,
                )
            )

            features = (
                extract_frame_features(
                    keypoints,
                    total_frames,
                )
            )

            if features is None:
                continue

            frame_rows.append(
                features
            )

            usable_frames += 1

    finally:
        cap.release()
        pose_estimator.close()

    # --------------------------------------------------------
    # Validate pose extraction
    # --------------------------------------------------------

    if len(frame_rows) < 20:
        raise ValueError(
            "Not enough usable pose frames "
            "were detected for running analysis."
        )

    frame_df = pd.DataFrame(
        frame_rows
    )

    # --------------------------------------------------------
    # Stride extraction
    # --------------------------------------------------------

    strides = extract_strides(
        frame_df
    )

    if not strides:
        raise ValueError(
            "No complete running strides "
            "could be detected."
        )

    stride_df = pd.DataFrame(
        strides
    )

    # --------------------------------------------------------
    # Load V2 model
    # --------------------------------------------------------

    model, model_features = (
        load_running_model()
    )

    # Verify required features exist
    missing_features = [
        feature
        for feature in model_features
        if feature
        not in stride_df.columns
    ]

    if missing_features:
        raise ValueError(
            "Missing V2 model features: "
            f"{missing_features}"
        )

    X = stride_df[
        model_features
    ]

    # --------------------------------------------------------
    # Predict every stride
    # --------------------------------------------------------

    predictions = model.predict(X)

    probabilities = (
        model.predict_proba(X)
    )

    stride_confidences = (
        probabilities.max(axis=1)
    )

    # Majority vote for video classification
    prediction_counts = Counter(
        predictions
    )

    running_type = (
        prediction_counts
        .most_common(1)[0][0]
    )

    # Confidence of strides classified as
    # the winning gait type.
    winning_mask = (
        predictions == running_type
    )

    if winning_mask.any():
        classification_confidence = float(
            stride_confidences[
                winning_mask
            ].mean()
        )
    else:
        classification_confidence = float(
            stride_confidences.mean()
        )

    # --------------------------------------------------------
    # Aggregate biomechanics across all detected strides
    # --------------------------------------------------------

    mean_left_knee_rom = float(
        stride_df[
            "left_knee_rom"
        ].mean()
    )

    mean_right_knee_rom = float(
        stride_df[
            "right_knee_rom"
        ].mean()
    )

    mean_knee_symmetry = float(
        stride_df[
            "knee_rom_symmetry"
        ].mean()
    )

    mean_left_hip_rom = float(
        stride_df[
            "left_hip_rom"
        ].mean()
    )

    mean_right_hip_rom = float(
        stride_df[
            "right_hip_rom"
        ].mean()
    )

    mean_hip_symmetry = float(
        stride_df[
            "hip_rom_symmetry"
        ].mean()
    )

    mean_torso_lean = float(
        stride_df[
            "torso_lean_mean"
        ].mean()
    )

    mean_torso_variation = float(
        stride_df[
            "torso_lean_std"
        ].mean()
    )

    mean_left_ankle_x = float(
        stride_df[
            "left_ankle_x_range"
        ].mean()
    )

    mean_right_ankle_x = float(
        stride_df[
            "right_ankle_x_range"
        ].mean()
    )

    # --------------------------------------------------------
    # Existing SportMetric-compatible output
    # --------------------------------------------------------

    metric_confidence = (
        classification_confidence
    )

    metrics = [
        {
            "metric_name":
                "left_knee_rom",

            "metric_value":
                round(
                    mean_left_knee_rom,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "right_knee_rom",

            "metric_value":
                round(
                    mean_right_knee_rom,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "knee_rom_symmetry",

            "metric_value":
                round(
                    mean_knee_symmetry,
                    3,
                ),

            "unit":
                "percent",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "left_hip_rom",

            "metric_value":
                round(
                    mean_left_hip_rom,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "right_hip_rom",

            "metric_value":
                round(
                    mean_right_hip_rom,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "hip_rom_symmetry",

            "metric_value":
                round(
                    mean_hip_symmetry,
                    3,
                ),

            "unit":
                "percent",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "torso_lean_mean",

            "metric_value":
                round(
                    mean_torso_lean,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "torso_lean_std",

            "metric_value":
                round(
                    mean_torso_variation,
                    3,
                ),

            "unit":
                "degrees",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "left_ankle_x_range",

            "metric_value":
                round(
                    mean_left_ankle_x,
                    4,
                ),

            "unit":
                "normalized",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },

        {
            "metric_name":
                "right_ankle_x_range",

            "metric_value":
                round(
                    mean_right_ankle_x,
                    4,
                ),

            "unit":
                "normalized",

            "confidence":
                round(
                    metric_confidence,
                    4,
                ),
        },
    ]

    # --------------------------------------------------------
    # Final result
    # --------------------------------------------------------

    return {
        # Context / classifier output
        "running_type":
            str(running_type),

        "classification_confidence":
            round(
                classification_confidence,
                4,
            ),

        # Processing information
        "stride_count":
            len(stride_df),

        "total_frames":
            total_frames,

        "usable_frames":
            usable_frames,

        # These objects match SportMetricCreate
        "metrics":
            metrics,
    }