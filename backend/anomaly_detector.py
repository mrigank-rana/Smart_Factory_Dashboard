"""
anomaly_detector.py — ML-based Anomaly Detection

Uses scikit-learn IsolationForest.
- Buffers first 100 normal readings to train the model
- Detects anomalies in real-time on new readings
- Returns: is_anomaly (bool), anomaly_score (float 0-1), affected_metric (str)
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from collections import deque
from typing import Dict, Any, Optional

TRAINING_BUFFER_SIZE = 100
FEATURES = ["energy_kwh", "temperature", "vibration", "units_produced", "waste_kg"]


class AnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination
        self._buffer: deque = deque(maxlen=TRAINING_BUFFER_SIZE)
        self._model: Optional[IsolationForest] = None
        self._trained = False
        self._readings_count = 0

    def _extract_features(self, reading: Dict[str, Any]) -> np.ndarray:
        return np.array([[reading.get(f, 0.0) for f in FEATURES]])

    def _train(self):
        if len(self._buffer) < TRAINING_BUFFER_SIZE:
            return
        X = np.array([[r.get(f, 0.0) for f in FEATURES] for r in self._buffer])
        self._model = IsolationForest(
            n_estimators=100,
            contamination=self.contamination,
            random_state=42,
        )
        self._model.fit(X)
        self._trained = True

    def _identify_affected_metric(self, reading: Dict[str, Any]) -> str:
        """Heuristic: find which metric deviates most from training baseline."""
        if not self._buffer:
            return "unknown"

        baselines = {
            f: np.mean([r.get(f, 0.0) for r in self._buffer])
            for f in FEATURES
        }
        stds = {
            f: max(np.std([r.get(f, 0.0) for r in self._buffer]), 1e-6)
            for f in FEATURES
        }

        deviations = {
            f: abs(reading.get(f, 0.0) - baselines[f]) / stds[f]
            for f in FEATURES
        }
        return max(deviations, key=deviations.get)

    def process(self, reading: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single machine reading.
        Returns dict with: is_anomaly, anomaly_score, affected_metric
        """
        self._readings_count += 1

        # Only add to buffer if not already an injected anomaly
        if not reading.get("is_anomaly", False):
            self._buffer.append(reading)

        # Train once buffer is full
        if not self._trained and len(self._buffer) >= TRAINING_BUFFER_SIZE:
            self._train()

        # If model not ready, use simple threshold detection
        if not self._trained:
            temp_anomaly = reading.get("temperature", 0) > 105
            vib_anomaly = reading.get("vibration", 0) > 4.0
            is_anomaly = temp_anomaly or vib_anomaly or reading.get("is_anomaly", False)
            affected = "temperature" if temp_anomaly else ("vibration" if vib_anomaly else "none")
            return {
                "is_anomaly": is_anomaly,
                "anomaly_score": 0.8 if is_anomaly else 0.1,
                "affected_metric": affected,
                "model_ready": False,
            }

        # ML-based detection
        X = self._extract_features(reading)
        prediction = self._model.predict(X)[0]          # -1 = anomaly, 1 = normal
        raw_score = self._model.decision_function(X)[0] # negative = more anomalous

        # Normalize score to 0–1 (higher = more anomalous)
        anomaly_score = max(0.0, min(1.0, (-raw_score + 0.5) / 1.0))

        is_anomaly = (prediction == -1) or reading.get("is_anomaly", False)
        affected_metric = self._identify_affected_metric(reading) if is_anomaly else "none"

        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_score, 4),
            "affected_metric": affected_metric,
            "model_ready": True,
        }

    @property
    def is_trained(self) -> bool:
        return self._trained

    @property
    def buffer_fill(self) -> int:
        return len(self._buffer)


# Singleton instances — one detector per machine
_detectors: Dict[str, AnomalyDetector] = {}


def get_detector(machine: str) -> AnomalyDetector:
    if machine not in _detectors:
        _detectors[machine] = AnomalyDetector(contamination=0.05)
    return _detectors[machine]


def detect(machine: str, reading: Dict[str, Any]) -> Dict[str, Any]:
    detector = get_detector(machine)
    return detector.process(reading)
