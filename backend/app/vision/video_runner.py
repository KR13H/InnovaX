import cv2

from app.vision.pose_estimator import PoseEstimator


def analyze_video(video_path: str, analyzer):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise OSError(f"Could not open video: {video_path}")

    pose_estimator = None
    frame_results = []

    try:
        pose_estimator = PoseEstimator()

        while True:
            success, frame = cap.read()

            if not success:
                break

            landmarks = pose_estimator.process_frame(frame)

            if landmarks:
                result = analyzer.analyze_frame(landmarks)

                if result:
                    frame_results.append(result)

        return analyzer.analyze_session(frame_results)

    finally:
        cap.release()

        if pose_estimator is not None:
            pose_estimator.close()