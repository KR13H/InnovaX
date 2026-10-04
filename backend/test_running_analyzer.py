from pprint import pprint

from app.analyzers.running import analyze_running_video


result = analyze_running_video(
    "test_video/test_video1.mp4"
)

pprint(result)