import cv2

from app.vision.pose_estimator import PoseEstimator


INPUT_VIDEO = "test_video/test_video1.mp4"
OUTPUT_VIDEO = "test_video/running_pose_output.mp4"


def main():
    estimator = PoseEstimator()

    video = cv2.VideoCapture(INPUT_VIDEO)

    if not video.isOpened():
        print("Could not open running video.")
        return

    fps = video.get(cv2.CAP_PROP_FPS)
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    writer = cv2.VideoWriter(
        OUTPUT_VIDEO,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    frame_count = 0
    detected_frames = 0

    while True:
        success, frame = video.read()

        if not success:
            break

        results = estimator.process_frame(frame)

        if (
            results.keypoints is not None
            and len(results.keypoints) > 0
    ):
            detected_frames += 1

        output_frame = estimator.draw_pose(
            frame,
            results,
        )

        writer.write(output_frame)

        frame_count += 1

    video.release()
    writer.release()
    estimator.close()

    print("Running pose analysis complete.")
    print(f"Frames processed: {frame_count}")
    print(f"Frames with pose detected: {detected_frames}")
    print(f"Output: {OUTPUT_VIDEO}")


if __name__ == "__main__":
    main()