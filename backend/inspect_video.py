import cv2


VIDEO_PATH = "cv_data/test/bowling_annotated.mp4"

cap = cv2.VideoCapture(VIDEO_PATH)

if not cap.isOpened():
    raise RuntimeError(f"Could not open: {VIDEO_PATH}")

frame_number = 0
paused = False

while True:

    if not paused:
        success, frame = cap.read()

        if not success:
            break

        frame_number = int(
            cap.get(cv2.CAP_PROP_POS_FRAMES)
        ) - 1

    display = frame.copy()

    cv2.putText(
        display,
        f"Frame: {frame_number}",
        (30, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.2,
        (0, 255, 255),
        3,
    )

    cv2.imshow("Inspect Bowling Video", display)

    key = cv2.waitKey(30 if not paused else 0) & 0xFF

    if key == ord("q"):
        break

    elif key == ord(" "):
        paused = not paused

    elif paused and key == ord("d"):
        frame_number += 1

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            frame_number,
        )

        success, frame = cap.read()

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            frame_number,
        )

    elif paused and key == ord("a"):
        frame_number = max(
            0,
            frame_number - 1,
        )

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            frame_number,
        )

        success, frame = cap.read()

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            frame_number,
        )


cap.release()
cv2.destroyAllWindows()