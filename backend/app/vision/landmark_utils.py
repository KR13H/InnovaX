import math


def get_landmark(landmarks, index):
    landmark = landmarks[index]

    return {
        "x": landmark.x,
        "y": landmark.y,
        "z": landmark.z,
        "visibility": landmark.visibility,
    }


def calculate_angle(a, b, c):
    if min(a["visibility"], b["visibility"], c["visibility"]) < 0.5:
        return None

    ab_x = a["x"] - b["x"]
    ab_y = a["y"] - b["y"]

    cb_x = c["x"] - b["x"]
    cb_y = c["y"] - b["y"]

    ab_length = math.sqrt(ab_x**2 + ab_y**2)
    cb_length = math.sqrt(cb_x**2 + cb_y**2)

    if ab_length == 0 or cb_length == 0:
        return None

    dot_product = ab_x * cb_x + ab_y * cb_y

    cosine = dot_product / (ab_length * cb_length)
    cosine = max(-1.0, min(1.0, cosine))

    return math.degrees(math.acos(cosine))