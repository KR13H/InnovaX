from abc import ABC, abstractmethod


class BaseAnalyzer(ABC):

    @abstractmethod
    def analyze_frame(self, landmarks):
        pass

    @abstractmethod
    def analyze_session(self, frame_results):
        pass

    def build_result(self, sport, metrics, session_score=None):
        return {
            "sport": sport,
            "session_score": session_score,
            "metrics": metrics,
        }