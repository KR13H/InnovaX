from app.analyzers.basketball_consistency import calculate_basketball_consistency


def test_stable_angles_are_more_consistent_than_varying_angles() -> None:
    stable_results = [
        {
            "right_elbow_angle": 100.0,
            "left_elbow_angle": 102.0,
            "right_knee_angle": 165.0,
            "left_knee_angle": 166.0,
        }
        for _ in range(4)
    ]
    varying_results = [
        {
            "right_elbow_angle": elbow,
            "left_elbow_angle": 180.0 - elbow,
            "right_knee_angle": knee,
            "left_knee_angle": 180.0 - knee,
        }
        for elbow, knee in ((60.0, 110.0), (140.0, 170.0), (70.0, 160.0), (150.0, 120.0))
    ]

    stable_score = calculate_basketball_consistency(stable_results)
    varying_score = calculate_basketball_consistency(varying_results)

    assert stable_score > varying_score
    assert 0 <= varying_score <= 100


def test_empty_and_insufficient_data_return_zero() -> None:
    assert calculate_basketball_consistency([]) == 0
    assert calculate_basketball_consistency([{"right_elbow_angle": 100.0}]) == 0
