import json

from app.analyzers.cricket import CricketAnalyzer


VIDEO_PATH = (
    "cv_data/bowling_phases/"
    "clips/delivery_03.mp4"
)


analyzer = CricketAnalyzer(
    bowling_arm="right"
)


result = analyzer.analyze_video(
    VIDEO_PATH
)


print()
print(
    json.dumps(
        result,
        indent=4,
    )
)