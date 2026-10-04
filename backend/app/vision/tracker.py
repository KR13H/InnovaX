import numpy as np


class PersonTrack:
    def __init__(
        self,
        track_id,
        keypoints,
        scores,
        frame_number,
    ):
        self.track_id = track_id

        self.frames = {
            frame_number: {
                "keypoints": keypoints.copy(),
                "scores": scores.copy(),
            }
        }

        self.last_centroid = self.get_centroid(
            keypoints,
            scores,
        )

        self.total_movement = 0.0
        self.last_frame = frame_number

    # --------------------------------------------------
    # Compatibility helpers
    # --------------------------------------------------

    @property
    def keypoints(self):
        """
        Allows:
            bowler.keypoints[frame_number]
        """

        return {
            frame_number: data["keypoints"]
            for frame_number, data
            in self.frames.items()
        }

    @property
    def scores(self):
        """
        Allows:
            bowler.scores[frame_number]
        """

        return {
            frame_number: data["scores"]
            for frame_number, data
            in self.frames.items()
        }

    # --------------------------------------------------
    # CENTROID
    # --------------------------------------------------

    @staticmethod
    def get_centroid(
        keypoints,
        scores,
        threshold=0.3,
    ):
        keypoints = np.asarray(keypoints)
        scores = np.asarray(scores)

        if keypoints.ndim != 2:
            return None

        if scores.ndim != 1:
            return None

        # Only first 17 COCO body points.
        # Ignore face / hands / detailed feet for tracking.
        body_keypoints = keypoints[:17]
        body_scores = scores[:17]

        valid = body_scores > threshold

        if not np.any(valid):
            return None

        return np.mean(
            body_keypoints[valid],
            axis=0,
        )

    # --------------------------------------------------
    # UPDATE TRACK
    # --------------------------------------------------

    def update(
        self,
        keypoints,
        scores,
        frame_number,
    ):
        new_centroid = self.get_centroid(
            keypoints,
            scores,
        )

        if (
            self.last_centroid is not None
            and new_centroid is not None
        ):
            movement = np.linalg.norm(
                new_centroid
                - self.last_centroid
            )

            self.total_movement += float(
                movement
            )

        self.frames[frame_number] = {
            "keypoints": keypoints.copy(),
            "scores": scores.copy(),
        }

        self.last_centroid = new_centroid
        self.last_frame = frame_number


class BowlerTracker:
    def __init__(
        self,
        max_distance=150,
        max_frame_gap=10,
    ):
        self.tracks = {}
        self.next_track_id = 0

        self.max_distance = max_distance
        self.max_frame_gap = max_frame_gap

    # --------------------------------------------------
    # NORMALIZE INPUT
    # --------------------------------------------------

    @staticmethod
    def _normalize_input(
        keypoints,
        scores,
    ):
        if keypoints is None or scores is None:
            return None, None

        keypoints = np.asarray(keypoints)
        scores = np.asarray(scores)

        if (
            keypoints.size == 0
            or scores.size == 0
        ):
            return None, None

        # One person:
        # (133, 2) -> (1, 133, 2)

        if keypoints.ndim == 2:
            keypoints = np.expand_dims(
                keypoints,
                axis=0,
            )

        # One person:
        # (133,) -> (1, 133)

        if scores.ndim == 1:
            scores = np.expand_dims(
                scores,
                axis=0,
            )

        if keypoints.ndim != 3:
            return None, None

        if scores.ndim != 2:
            return None, None

        if (
            keypoints.shape[0]
            != scores.shape[0]
        ):
            return None, None

        return keypoints, scores

    # --------------------------------------------------
    # UPDATE ALL PEOPLE IN FRAME
    # --------------------------------------------------

    def update(
        self,
        keypoints,
        scores,
        frame_number,
    ):
        keypoints, scores = (
            self._normalize_input(
                keypoints,
                scores,
            )
        )

        if keypoints is None:
            return

        used_tracks = set()

        for person_index in range(
            keypoints.shape[0]
        ):
            person_keypoints = (
                keypoints[person_index]
            )

            person_scores = (
                scores[person_index]
            )

            centroid = (
                PersonTrack.get_centroid(
                    person_keypoints,
                    person_scores,
                )
            )

            if centroid is None:
                continue

            best_track = None
            best_distance = float("inf")

            # ------------------------------------------
            # FIND NEAREST EXISTING PERSON
            # ------------------------------------------

            for (
                track_id,
                track,
            ) in self.tracks.items():

                if track_id in used_tracks:
                    continue

                frame_gap = (
                    frame_number
                    - track.last_frame
                )

                if (
                    frame_gap
                    > self.max_frame_gap
                ):
                    continue

                if (
                    track.last_centroid
                    is None
                ):
                    continue

                distance = np.linalg.norm(
                    centroid
                    - track.last_centroid
                )

                if (
                    distance
                    < best_distance
                    and distance
                    < self.max_distance
                ):
                    best_distance = distance
                    best_track = track

            # ------------------------------------------
            # CREATE NEW TRACK
            # ------------------------------------------

            if best_track is None:

                new_track = PersonTrack(
                    track_id=self.next_track_id,
                    keypoints=person_keypoints,
                    scores=person_scores,
                    frame_number=frame_number,
                )

                self.tracks[
                    self.next_track_id
                ] = new_track

                used_tracks.add(
                    self.next_track_id
                )

                self.next_track_id += 1

            # ------------------------------------------
            # UPDATE EXISTING TRACK
            # ------------------------------------------

            else:

                best_track.update(
                    person_keypoints,
                    person_scores,
                    frame_number,
                )

                used_tracks.add(
                    best_track.track_id
                )

    # --------------------------------------------------
    # SELECT BOWLER
    # --------------------------------------------------

    def get_bowler_track(
        self,
        min_frames=10,
    ):
        if not self.tracks:
            return None

        valid_tracks = [
            track
            for track
            in self.tracks.values()
            if len(track.frames)
            >= min_frames
        ]

        if not valid_tracks:
            return None

        # For a delivery clip, bowler generally
        # accumulates more body movement than
        # batsman / umpire.
        return max(
            valid_tracks,
            key=lambda track:
                track.total_movement,
        )