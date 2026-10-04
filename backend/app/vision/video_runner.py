import cv2


def analyze_video(video_path: str, analyzer, pose_estimator):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise OSError(f"Could not open video: {video_path}")

    frame_results = []

    try:
        while True:
            success, frame = cap.read()

            if not success:
                break

            landmarks = pose_estimator.process_frame(frame)

            if landmarks is not None:
                result = analyzer.analyze_frame(landmarks)

                if result:
                    frame_results.append(result)

        return analyzer.analyze_session(frame_results)

    finally:
        cap.release()
        pose_estimator.close()
