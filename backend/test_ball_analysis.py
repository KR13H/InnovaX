import cv2
import json

from app.vision.ball_detector import CricketBallDetector
from app.vision.ball_tracker import BallTracker
from app.vision.ball_analysis import BallAnalysis
from app.vision.calibration import PitchCalibration


VIDEO_PATH = "cv_data/test/ball_test2.mp4"
CALIBRATION_PATH = "cv_data/test/pitch_calibration.json"
OUTPUT_PATH = "cv_data/test/output_ball_analysis.mp4"


# --------------------------------------------------
# LOAD CALIBRATION
# --------------------------------------------------

with open(
    CALIBRATION_PATH,
    "r",
) as f:
    calibration_data = json.load(f)


calibration = PitchCalibration()

calibration.calibrate(
    calibration_data["image_points"]
)


print("Pitch calibration loaded")
print(
    "Points:",
    calibration_data["image_points"],
)


# --------------------------------------------------
# MODELS
# --------------------------------------------------

detector = CricketBallDetector()
tracker = BallTracker()


# --------------------------------------------------
# OPEN VIDEO
# --------------------------------------------------

cap = cv2.VideoCapture(
    VIDEO_PATH
)

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video: {VIDEO_PATH}"
    )


fps = cap.get(
    cv2.CAP_PROP_FPS
)

width = int(
    cap.get(
        cv2.CAP_PROP_FRAME_WIDTH
    )
)

height = int(
    cap.get(
        cv2.CAP_PROP_FRAME_HEIGHT
    )
)

frame_count = int(
    cap.get(
        cv2.CAP_PROP_FRAME_COUNT
    )
)


print()
print("VIDEO")
print("----------------")
print("FPS:", fps)
print("Width:", width)
print("Height:", height)
print("Frames:", frame_count)
print()


frames = []

frame_number = 0


# --------------------------------------------------
# PASS 1
# YOLO + BALL TRACKING
# --------------------------------------------------

while True:

    success, frame = cap.read()

    if not success:
        break


    detections = detector.process_frame(
        frame
    )


    tracker.update(
        detections,
        frame_number,
    )


    frames.append(
        frame.copy()
    )


    frame_number += 1


    if frame_number % 30 == 0:
        print(
            f"Tracking "
            f"{frame_number}/"
            f"{frame_count}"
        )


cap.release()


# --------------------------------------------------
# GET TRAJECTORY
# --------------------------------------------------

trajectory = tracker.get_trajectory()


print()
print(
    f"Tracked points: "
    f"{len(trajectory)}"
)


# --------------------------------------------------
# ANALYSIS
# --------------------------------------------------

analyzer = BallAnalysis(
    fps=fps,
    calibration=calibration,
)


analysis = analyzer.analyze(
    trajectory=trajectory,
    frame_width=width,
    frame_height=height,
)


release = analysis["release"]
bounce = analysis["bounce"]


# --------------------------------------------------
# PRINT PIXEL + WORLD COORDINATES
# --------------------------------------------------

print()
print("CRICKET BALL ANALYSIS")
print("--------------------------")


if release is not None:

    release_world = (
        calibration.pixel_to_world(
            release["x"],
            release["y"],
        )
    )

    print()
    print("RELEASE")
    print("Frame:", release["frame"])

    print(
        "Pixel:",
        round(release["x"], 2),
        round(release["y"], 2),
    )

    if release_world is not None:
        print(
            "World metres:",
            round(release_world[0], 2),
            round(release_world[1], 2),
        )

else:
    release_world = None
    print("Release: not detected")


if bounce is not None:

    bounce_world = (
        calibration.pixel_to_world(
            bounce["x"],
            bounce["y"],
        )
    )

    print()
    print("BOUNCE")
    print("Frame:", bounce["frame"])

    print(
        "Pixel:",
        round(bounce["x"], 2),
        round(bounce["y"], 2),
    )

    if bounce_world is not None:
        print(
            "World metres:",
            round(bounce_world[0], 2),
            round(bounce_world[1], 2),
        )

else:
    bounce_world = None
    print("Bounce: not detected")


print()
print(
    "Line:",
    analysis["line"],
)

print(
    "Length:",
    analysis["length"],
)

print(
    "Speed:",
    (
        f"{analysis['speed_kmh']} km/h"
        if analysis["speed_kmh"] is not None
        else "not available"
    ),
)

print(
    "Trajectory points:",
    len(
        analysis["trajectory"]
    ),
)


# --------------------------------------------------
# CREATE OUTPUT VIDEO
# --------------------------------------------------

writer = cv2.VideoWriter(
    OUTPUT_PATH,
    cv2.VideoWriter_fourcc(
        *"mp4v"
    ),
    fps,
    (
        width,
        height,
    ),
)


delivery_trajectory = (
    analysis["trajectory"]
)


# --------------------------------------------------
# PASS 2
# DRAW EVERYTHING
# --------------------------------------------------

for frame_number, frame in enumerate(
    frames
):


    # ------------------------------------------
    # DRAW BALL TRAJECTORY UP TO CURRENT FRAME
    # ------------------------------------------

    visible_points = [
        point
        for point
        in delivery_trajectory
        if point["frame"]
        <= frame_number
    ]


    recent_points = (
        visible_points[-30:]
    )


    for i in range(
        1,
        len(recent_points),
    ):

        p1 = recent_points[i - 1]
        p2 = recent_points[i]


        if (
            p2["frame"]
            - p1["frame"]
            <= 2
        ):

            cv2.line(
                frame,
                (
                    int(p1["x"]),
                    int(p1["y"]),
                ),
                (
                    int(p2["x"]),
                    int(p2["y"]),
                ),
                (255, 0, 0),
                3,
            )


    # ------------------------------------------
    # DRAW CURRENT BALL POSITION
    # ------------------------------------------

    current_points = [
        point
        for point
        in trajectory
        if point["frame"]
        == frame_number
    ]


    if current_points:

        point = current_points[0]

        x = int(
            point["x"]
        )

        y = int(
            point["y"]
        )


        if point["predicted"]:

            cv2.circle(
                frame,
                (x, y),
                7,
                (0, 255, 255),
                2,
            )

        else:

            cv2.circle(
                frame,
                (x, y),
                7,
                (0, 255, 0),
                -1,
            )


    # ------------------------------------------
    # RELEASE MARKER
    # ------------------------------------------

    if (
        release is not None
        and frame_number
        >= release["frame"]
    ):

        rx = int(
            release["x"]
        )

        ry = int(
            release["y"]
        )


        cv2.circle(
            frame,
            (rx, ry),
            12,
            (0, 255, 0),
            3,
        )


        cv2.putText(
            frame,
            "RELEASE",
            (
                rx + 15,
                ry,
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2,
        )


    # ------------------------------------------
    # BOUNCE MARKER
    # ------------------------------------------

    if (
        bounce is not None
        and frame_number
        >= bounce["frame"]
    ):

        bx = int(
            bounce["x"]
        )

        by = int(
            bounce["y"]
        )


        cv2.circle(
            frame,
            (bx, by),
            12,
            (0, 0, 255),
            3,
        )


        cv2.putText(
            frame,
            "BOUNCE",
            (
                bx + 15,
                by,
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2,
        )


    # ------------------------------------------
    # DASHBOARD
    # ------------------------------------------

    cv2.putText(
        frame,
        f"LINE: "
        f"{analysis['line']}",
        (
            30,
            50,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )


    cv2.putText(
        frame,
        f"LENGTH: "
        f"{analysis['length']}",
        (
            30,
            85,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )


    if (
        analysis["speed_kmh"]
        is not None
    ):

        speed_text = (
            f"SPEED: "
            f"{analysis['speed_kmh']} km/h"
        )

    else:

        speed_text = (
            "SPEED: unavailable"
        )


    cv2.putText(
        frame,
        speed_text,
        (
            30,
            120,
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )


    # ------------------------------------------
    # WORLD BOUNCE LOCATION
    # ------------------------------------------

    if bounce_world is not None:

        world_text = (
            f"BOUNCE POS: "
            f"{bounce_world[0]:.2f}m, "
            f"{bounce_world[1]:.2f}m"
        )


        cv2.putText(
            frame,
            world_text,
            (
                30,
                155,
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2,
        )


    writer.write(
        frame
    )


writer.release()


print()
print("DONE")

print(
    f"Output saved to: "
    f"{OUTPUT_PATH}"
)