"""
kpi_engine.py — KPI Calculations for Smart Factory

Calculates:
  - OEE (Availability × Performance × Quality)
  - Energy Per Unit
  - Waste Rate
  - CO2 Footprint
  - Cost
  - Factory-wide aggregate KPIs
"""

from typing import List, Dict, Any

# Constants
PLANNED_RUN_TIME = 3600          # seconds — 1 hour planning window
IDEAL_SPEED_PER_MACHINE = {
    "Machine_A": 120,
    "Machine_B": 100,
    "Machine_C": 140,
    "Machine_D": 90,
}
INPUT_MATERIAL_KG_PER_UNIT = 1.0   # 1 kg raw material per unit
CO2_EMISSION_FACTOR = 0.4          # kg CO₂ per kWh
ELECTRICITY_RATE = 0.12            # USD per kWh


def calc_oee(machine: str, status: str, units_produced: int,
             energy_kwh: float, waste_kg: float,
             actual_run_seconds: float = 2700) -> dict:
    """
    OEE = Availability × Performance × Quality

    Availability: actual_run_time / planned_run_time
    Performance:  actual_speed / ideal_speed   (units per 3s tick projected to hourly)
    Quality:      good_units / total_units
    """
    # Availability — idle machines count as 0% available
    if status == "idle":
        availability = 0.0
    elif status in ("warning", "critical"):
        availability = 0.65
    else:
        availability = actual_run_seconds / PLANNED_RUN_TIME

    availability = min(1.0, max(0.0, availability))

    # Performance — units_produced is per 3-second tick; ideal is per-hour
    ideal_speed = IDEAL_SPEED_PER_MACHINE.get(machine, 100)
    # Scale actual to same window: 3s tick → units/hour equivalent
    actual_hourly_equivalent = units_produced * (3600 / 3)
    performance = actual_hourly_equivalent / ideal_speed if ideal_speed > 0 else 0
    performance = min(1.0, max(0.0, performance))

    # Quality — good units vs total (waste treated as bad units)
    total_units = units_produced + int(waste_kg / INPUT_MATERIAL_KG_PER_UNIT)
    quality = units_produced / total_units if total_units > 0 else 0.0
    quality = min(1.0, max(0.0, quality))

    oee = availability * performance * quality

    return {
        "availability": round(availability * 100, 2),
        "performance": round(performance * 100, 2),
        "quality": round(quality * 100, 2),
        "oee": round(oee * 100, 2),
    }


def calc_energy_per_unit(energy_kwh: float, units_produced: int) -> float:
    if units_produced == 0:
        return 0.0
    return round(energy_kwh / units_produced, 4)


def calc_waste_rate(waste_kg: float, units_produced: int) -> float:
    """Waste rate as percentage of input material."""
    input_material = units_produced * INPUT_MATERIAL_KG_PER_UNIT
    if input_material == 0:
        return 0.0
    return round((waste_kg / input_material) * 100, 2)


def calc_co2(energy_kwh: float) -> float:
    return round(energy_kwh * CO2_EMISSION_FACTOR, 4)


def calc_cost(energy_kwh: float) -> float:
    return round(energy_kwh * ELECTRICITY_RATE, 4)


def process_readings(readings: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Given a list of current sensor readings (one per machine),
    return full KPIs dict including per-machine and factory-wide.
    """
    machines = {}
    total_energy = 0.0
    total_units = 0
    total_waste = 0.0
    total_cost = 0.0
    total_co2 = 0.0
    oee_values = []

    for r in readings:
        m = r["machine"]
        oee_data = calc_oee(
            machine=m,
            status=r["status"],
            units_produced=r["units_produced"],
            energy_kwh=r["energy_kwh"],
            waste_kg=r["waste_kg"],
        )
        energy_per_unit = calc_energy_per_unit(r["energy_kwh"], r["units_produced"])
        waste_rate = calc_waste_rate(r["waste_kg"], r["units_produced"])
        co2 = calc_co2(r["energy_kwh"])
        cost = calc_cost(r["energy_kwh"])

        machines[m] = {
            **r,
            **oee_data,
            "energy_per_unit": energy_per_unit,
            "waste_rate": waste_rate,
            "co2_kg": co2,
            "cost_usd": cost,
        }

        total_energy += r["energy_kwh"]
        total_units += r["units_produced"]
        total_waste += r["waste_kg"]
        total_cost += cost
        total_co2 += co2
        oee_values.append(oee_data["oee"])

    factory_oee = round(sum(oee_values) / len(oee_values), 2) if oee_values else 0.0
    factory_energy_per_unit = calc_energy_per_unit(total_energy, total_units)
    factory_waste_rate = calc_waste_rate(total_waste, total_units)

    return {
        "factory": {
            "oee": factory_oee,
            "energy_kwh": round(total_energy, 3),
            "energy_per_unit": factory_energy_per_unit,
            "units_produced": total_units,
            "waste_kg": round(total_waste, 2),
            "waste_rate": factory_waste_rate,
            "co2_kg": round(total_co2, 3),
            "cost_usd": round(total_cost, 4),
        },
        "machines": machines,
    }
