import json

from app.analyzers.cricket_full import (
    FullCricketAnalyzer
)


VIDEO_PATH = (
    "cv_data/bowling_phases/"
    "clips/delivery_01.mp4"
)


analyzer = FullCricketAnalyzer(
    bowling_arm="right"
)


result = analyzer.analyze(
    VIDEO_PATH
)


print(
    json.dumps(
        result,
        indent=4,
    )
)