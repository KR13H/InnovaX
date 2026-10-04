import numpy as np


def joint_angle(a, b, c):
    """Angle in degrees at point b. Points use pixel coordinates."""
    a, b, c = [np.asarray(point, dtype=float) for point in (a, b, c)]

    ba = a - b
    bc = c - b
    denominator = np.linalg.norm(ba) * np.linalg.norm(bc)

    if denominator < 1e-8:
        return None

    cosine = np.clip(np.dot(ba, bc) / denominator, -1.0, 1.0)
    return float(np.degrees(np.arccos(cosine)))


def landmark_angle(landmarks, indices, width, height, min_visibility=0.6):
    """Return None when any required landmark is poorly visible."""
    points = []

    for index in indices:
        landmark = landmarks[index]

        if (landmark.visibility or 0.0) < min_visibility:
            return None

        points.append((landmark.x * width, landmark.y * height))

    return joint_angle(*points)