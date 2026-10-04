def map_mediapipe_to_shot7m2(landmarks):
    def p(i):
        lm = landmarks[i]
        return [lm.x, lm.y, lm.z]

    def midpoint(a, b):
        return [
            (a[0] + b[0]) / 2,
            (a[1] + b[1]) / 2,
            (a[2] + b[2]) / 2,
        ]

    left_hip = p(23)
    right_hip = p(24)

    hip_center = midpoint(left_hip, right_hip)

    left_shoulder = p(11)
    right_shoulder = p(12)

    shoulder_center = midpoint(left_shoulder, right_shoulder)

    spine_1 = [
        hip_center[i] + 0.2 * (shoulder_center[i] - hip_center[i])
        for i in range(3)
    ]

    spine_2 = [
        hip_center[i] + 0.4 * (shoulder_center[i] - hip_center[i])
        for i in range(3)
    ]

    spine_3 = [
        hip_center[i] + 0.6 * (shoulder_center[i] - hip_center[i])
        for i in range(3)
    ]

    upper_spine = [
        hip_center[i] + 0.8 * (shoulder_center[i] - hip_center[i])
        for i in range(3)
    ]

    neck = shoulder_center

    head = p(0)

    head_top = [
        head[i] + (head[i] - neck[i]) * 0.25
        for i in range(3)
    ]

    left_hand = midpoint(p(17), p(19))
    right_hand = midpoint(p(18), p(20))

    shot = [
        hip_center,
        left_hip,
        p(25),
        p(27),
        p(29),
        p(31),
        right_hip,
        p(26),
        p(28),
        p(30),
        p(32),
        spine_1,
        spine_2,
        spine_3,
        upper_spine,
        left_shoulder,
        p(13),
        p(15),
        left_hand,
        neck,
        head,
        head_top,
        right_shoulder,
        p(14),
        p(16),
        right_hand,
    ]

    return shot