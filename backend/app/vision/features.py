import numpy as np


def extract_features(landmarks, width, height):
    if landmarks is None:
        return None

    indices = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]

    points = np.array(
        [[landmarks[i].x * width, landmarks[i].y * height]
         for i in indices],
        dtype=np.float32,
    )

    visibility = np.array(
        [landmarks[i].visibility or 0.0 for i in indices],
        dtype=np.float32,
    )

    if not np.isfinite(points).all():
        return None

    hip_center = (points[6] + points[7]) / 2
    shoulder_center = (points[0] + points[1]) / 2
    torso_length = np.linalg.norm(shoulder_center - hip_center)

    if torso_length < 1e-6:
        return None

    normalized = (points - hip_center) / torso_length
    return np.concatenate([normalized.flatten(), visibility])