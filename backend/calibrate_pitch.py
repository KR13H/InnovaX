import cv2
import json


VIDEO_PATH = "cv_data/test/ball_test2.mp4"
OUTPUT_PATH = "cv_data/test/pitch_calibration.json"

points = []
selected_frame = None


def mouse_callback(event, x, y, flags, param):
    global points

    if event == cv2.EVENT_LBUTTONDOWN:
        if len(points) < 4:
            points.append([x, y])
            print(f"Point {len(points)}: ({x}, {y})")


cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    raise RuntimeError(
        f"Could not open video: {VIDEO_PATH}"
    )

fps = cap.get(cv2.CAP_PROP_FPS)
frame_count = int(
    cap.get(cv2.CAP_PROP_FRAME_COUNT)
)

frame_index = 0

window_name = "Pitch Calibration"

cv2.namedWindow(
    window_name,
    cv2.WINDOW_NORMAL,
)

cv2.setMouseCallback(
    window_name,
    mouse_callback,
)

print()
print("CONTROLS")
print("-------------------------")
print("D = next frame")
print("A = previous frame")
print("F = jump forward 10 frames")
print("B = jump backward 10 frames")
print("ENTER = select current frame")
print("R = reset points")
print("S = save calibration")
print("Q = quit")
print()


while True:

    cap.set(
        cv2.CAP_PROP_POS_FRAMES,
        frame_index,
    )

    success, frame = cap.read()

    if not success:
        break

    display = frame.copy()

    # Draw currently selected points
    for i, point in enumerate(points):

        x, y = point

        cv2.circle(
            display,
            (x, y),
            8,
            (0, 0, 255),
            -1,
        )

        cv2.putText(
            display,
            str(i + 1),
            (x + 10, y - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
        )

    # Draw polygon
    if len(points) > 1:

        for i in range(len(points) - 1):

            cv2.line(
                display,
                tuple(points[i]),
                tuple(points[i + 1]),
                (255, 0, 0),
                2,
            )

    if len(points) == 4:

        cv2.line(
            display,
            tuple(points[3]),
            tuple(points[0]),
            (255, 0, 0),
            2,
        )

    cv2.putText(
        display,
        f"Frame: {frame_index}/{frame_count}",
        (30, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
    )

    cv2.imshow(
        window_name,
        display,
    )

    key = cv2.waitKey(0) & 0xFF

    # Next frame
    if key == ord("d"):

        frame_index = min(
            frame_index + 1,
            frame_count - 1,
        )

        points = []

    # Previous frame
    elif key == ord("a"):

        frame_index = max(
            frame_index - 1,
            0,
        )

        points = []

    # Jump forward
    elif key == ord("f"):

        frame_index = min(
            frame_index + 10,
            frame_count - 1,
        )

        points = []

    # Jump backward
    elif key == ord("b"):

        frame_index = max(
            frame_index - 10,
            0,
        )

        points = []

    # Reset
    elif key == ord("r"):

        points = []

        print("Points reset")

    # Save
    elif key == ord("s"):

        if len(points) != 4:

            print(
                "You need exactly 4 points"
            )

            continue

        data = {
            "frame": frame_index,
            "image_points": points,
        }

        with open(
            OUTPUT_PATH,
            "w",
        ) as f:

            json.dump(
                data,
                f,
                indent=4,
            )

        print()
        print(
            f"Calibration saved to "
            f"{OUTPUT_PATH}"
        )

        print(
            "Frame:",
            frame_index,
        )

        print(
            "Points:",
            points,
        )

        break

    elif key == ord("q"):

        break


cap.release()
cv2.destroyAllWindows()