import cv2
import numpy as np


class PitchCalibration:
    def __init__(self):
        self.homography = None

    def calibrate(self, image_points):
        """
        image_points:
        Four points selected from the video frame.

        Order:
        1. bowling crease left
        2. bowling crease right
        3. batting crease right
        4. batting crease left

        Real pitch coordinate system:
        x = width across pitch
        y = distance toward batter
        """

        image_points = np.array(
            image_points,
            dtype=np.float32,
        )

        # Approximate usable pitch width
        pitch_width = 3.05

        # Cricket pitch length
        pitch_length = 20.12

        world_points = np.array(
            [
                [0.0, 0.0],
                [pitch_width, 0.0],
                [pitch_width, pitch_length],
                [0.0, pitch_length],
            ],
            dtype=np.float32,
        )

        self.homography, _ = cv2.findHomography(
            image_points,
            world_points,
        )

    def pixel_to_world(self, x, y):
        if self.homography is None:
            return None

        point = np.array(
            [[[x, y]]],
            dtype=np.float32,
        )

        transformed = cv2.perspectiveTransform(
            point,
            self.homography,
        )

        world_x = float(transformed[0][0][0])
        world_y = float(transformed[0][0][1])

        return world_x, world_y