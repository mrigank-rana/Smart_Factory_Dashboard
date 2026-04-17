"""
simulate_sensors.py — IoT Sensor Data Simulator

Simulates 4 industrial machines with realistic sensor patterns:
- Daily energy peaks (8am–5pm via sine curve)
- Per-machine random walk so values drift dynamically between readings
- Occasional random load spikes (burst events)
- anomaly_mode flag to spike metrics for demo
"""

import math
import random
from datetime import datetime, timezone

MACHINES = ["Machine_A", "Machine_B", "Machine_C", "Machine_D"]

# Base configuration per machine — personality differences
MACHINE_CONFIG = {
    "Machine_A": {"base_temp": 72, "base_vib": 0.8, "ideal_rate": 120, "efficiency": 0.92},
    "Machine_B": {"base_temp": 75, "base_vib": 1.1, "ideal_rate": 100, "efficiency": 0.88},
    "Machine_C": {"base_temp": 68, "base_vib": 0.6, "ideal_rate": 140, "efficiency": 0.95},
    "Machine_D": {"base_temp": 80, "base_vib": 1.4, "ideal_rate": 90,  "efficiency": 0.85},
}

# ── Per-machine random walk state ────────────────────────────────────────────
# These persist across calls so values drift (not jump) between readings
_walk = {m: {"energy": 0.0, "temp": 0.0, "vib": 0.0} for m in MACHINES}

# ── Global anomaly state ──────────────────────────────────────────────────────
_anomaly_machine: str | None = None
_anomaly_ticks: int = 0

# ── Sensor Hardware Simulation ─────────────────────────────────────────────────
# Starting values for sensor age (days) and accuracy (%)
_sensors = {
    m: {
        "age_days": random.randint(10, 400),
        "calibration_drift": random.uniform(0.01, 1.5)
    } for m in MACHINES
}


def set_anomaly(machine: str, duration_ticks: int = 20):
    global _anomaly_machine, _anomaly_ticks
    _anomaly_machine = machine
    _anomaly_ticks = duration_ticks


def balance_load(source_machine: str) -> str:
    global _anomaly_machine, _anomaly_ticks
    
    # Identify target machine with lowest combined base + walk temp
    available_machines = [m for m in MACHINES if m != source_machine]
    if not available_machines:
        return source_machine
        
    target_machine = min(available_machines, 
                         key=lambda m: MACHINE_CONFIG[m]["base_temp"] + _walk[m]["temp"])
    
    # 1. Clear any active anomaly on the source machine
    if _anomaly_machine == source_machine:
        _anomaly_ticks = 0
        _anomaly_machine = None
        
    # 2. Hard-drop the accumulated heat and vibration on the source machine 
    # so it immediately goes back into normal boundaries
    _walk[source_machine]["temp"] = min(_walk[source_machine]["temp"], -8.0) # force cooling
    _walk[source_machine]["vib"] = min(_walk[source_machine]["vib"], -0.2)
    _walk[source_machine]["energy"] = min(_walk[source_machine]["energy"], -1.0)
    
    # 3. Transfer the workload to the target machine causing a slight bump
    _walk[target_machine]["temp"] += 5.0
    _walk[target_machine]["vib"] += 0.8
    _walk[target_machine]["energy"] += 2.0
    
    return target_machine


def _energy_factor(hour: float) -> float:
    """
    Returns a 0–1 energy multiplier based on time of day.
    Peaks around 8am–5pm with a broad Gaussian bell.
    """
    peak = 12.5
    width = 6.0
    factor = math.exp(-0.5 * ((hour - peak) / width) ** 2)
    return 0.20 + 0.80 * factor   # minimum 20% at night


def _derive_status(temperature: float, vibration: float) -> str:
    if temperature > 110 or vibration > 4.5:
        return "critical"
    if temperature > 90 or vibration > 2.8:
        return "warning"
    if temperature < 62 and vibration < 0.3:
        return "idle"
    return "running"


def generate_reading(machine: str, anomaly_override: bool = False) -> dict:
    global _anomaly_machine, _anomaly_ticks

    cfg = MACHINE_CONFIG[machine]
    now = datetime.now(timezone.utc)
    hour = now.hour + now.minute / 60.0
    ef = _energy_factor(hour)

    w = _walk[machine]

    # ── Random walk update (drift ±step each tick) ───────────────────────────
    # Keeping walk bounded so it doesn't explode
    w["energy"] = max(-3.0, min( 3.0, w["energy"] + random.gauss(0, 0.6)))
    w["temp"]   = max(-8.0, min( 8.0, w["temp"]   + random.gauss(0, 1.2)))
    w["vib"]    = max(-0.5, min( 0.5, w["vib"]    + random.gauss(0, 0.08)))

    # Occasional load spike: ~12% chance per reading
    spike_energy = random.uniform(1.5, 4.5) if random.random() < 0.12 else 0.0
    spike_temp   = random.uniform(3.0, 9.0) if random.random() < 0.10 else 0.0
    spike_vib    = random.uniform(0.2, 0.8) if random.random() < 0.10 else 0.0

    # ── Energy ──────────────────────────────────────────────────────────────
    base_kwh = 5.0 + 15.0 * ef
    energy_kwh = (base_kwh * cfg["efficiency"]
                  + w["energy"]
                  + spike_energy
                  + random.gauss(0, 0.8))          # larger iid noise
    energy_kwh = max(0.5, energy_kwh)

    # ── Temperature ─────────────────────────────────────────────────────────
    temperature = (cfg["base_temp"]
                   + 12 * ef
                   + w["temp"]
                   + spike_temp
                   + random.gauss(0, 3.0))          # ±3°C iid noise
    temperature = max(55.0, temperature)

    # ── Vibration ───────────────────────────────────────────────────────────
    vibration = (cfg["base_vib"]
                 + 0.4 * ef
                 + w["vib"]
                 + spike_vib
                 + random.gauss(0, 0.12))           # ±0.12 iid noise
    vibration = max(0.05, vibration)

    # ── Production ──────────────────────────────────────────────────────────
    units_produced = int(cfg["ideal_rate"] * ef * cfg["efficiency"]
                         + random.gauss(0, 8))       # more variance in units
    units_produced = max(0, units_produced)

    # ── Waste ───────────────────────────────────────────────────────────────
    waste_rate_base = 0.04 + random.gauss(0, 0.008)
    waste_kg = max(0.0, units_produced * waste_rate_base)

    # ── Anomaly injection ────────────────────────────────────────────────────
    is_anomaly   = False
    anomaly_score = 0.0

    trigger = anomaly_override or (machine == _anomaly_machine and _anomaly_ticks > 0)
    if trigger:
        temperature  += random.uniform(40, 60)    # spike temp to 130-160°C
        vibration    += random.uniform(4.0, 7.0)  # spike vibration to 5-9
        energy_kwh   *= random.uniform(1.5, 2.0)  # 50-100% energy surge
        units_produced = max(0, units_produced - random.randint(20, 50))  # production drop
        is_anomaly    = True
        anomaly_score = random.uniform(0.78, 0.99)
        if machine == _anomaly_machine:
            _anomaly_ticks -= 1
            if _anomaly_ticks <= 0:
                _anomaly_machine = None

    # ── Sensor Hardware Updates ─────────────────────────────────────────────
    # Randomly age sensors and increase drift slightly
    s = _sensors[machine]
    if random.random() < 0.05:  # small chance to age
        s["age_days"] += 1
    if random.random() < 0.10:
        s["calibration_drift"] += random.uniform(0.001, 0.01)
    
    accuracy = max(50.0, 100.0 - (s["age_days"] * 0.05) - (s["calibration_drift"] * 10))
    health_status = "Good"
    if accuracy < 75.0 or s["age_days"] > 350:
        health_status = "Replace"
    elif accuracy < 85.0:
        health_status = "Degraded"

    sensor_health = {
        "age_days": s["age_days"],
        "accuracy": round(accuracy, 1),
        "status": health_status
    }

    return {
        "timestamp":      now.isoformat(),
        "machine":        machine,
        "energy_kwh":     round(energy_kwh, 3),
        "temperature":    round(temperature, 2),
        "vibration":      round(vibration, 3),
        "units_produced": units_produced,
        "waste_kg":       round(waste_kg, 2),
        "status":         _derive_status(temperature, vibration),
        "is_anomaly":     is_anomaly,
        "anomaly_score":  anomaly_score,
        "sensor_health":  sensor_health,
    }


def generate_all_readings(anomaly_machine: str | None = None) -> list[dict]:
    """Generate one reading per machine."""
    return [
        generate_reading(m, anomaly_override=(m == anomaly_machine))
        for m in MACHINES
    ]
