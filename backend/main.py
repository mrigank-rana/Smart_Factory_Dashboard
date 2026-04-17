import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import init_db, insert_reading, insert_alert, get_history, get_alerts, dismiss_alert
from simulate_sensors import generate_all_readings, set_anomaly, balance_load, MACHINES
from kpi_engine import process_readings
from anomaly_detector import detect

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── State ────────────────────────────────────────────────────────────────────
_latest_readings: list = []
_latest_kpis: dict = {}
_active_alerts: list = []
_sim_speed: int = 1          # 1x, 5x, 10x


def sanitize_reading(r: dict) -> dict:
    """Convert all values to plain Python JSON-serializable types."""
    return {
        "timestamp":      str(r.get("timestamp", "")),
        "machine":        str(r.get("machine", "")),
        "energy_kwh":     float(r.get("energy_kwh", 0)),
        "temperature":    float(r.get("temperature", 0)),
        "vibration":      float(r.get("vibration", 0)),
        "units_produced": int(r.get("units_produced", 0)),
        "waste_kg":       float(r.get("waste_kg", 0)),
        "status":         str(r.get("status", "idle")),
        "is_anomaly":     bool(r.get("is_anomaly", False)),
        "anomaly_score":  float(r.get("anomaly_score", 0.0)),
        "affected_metric": str(r.get("affected_metric", "none")),
        "sensor_health":  r.get("sensor_health", {}),
    }


def sanitize_alert(a: dict) -> dict:
    return {k: (bool(v) if isinstance(v, bool) else
                float(v) if isinstance(v, float) else
                int(v) if isinstance(v, int) else str(v))
            for k, v in a.items()}


# ── WebSocket connection manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"WS connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        try:
            self.active.remove(ws)
        except ValueError:
            pass
        logger.info(f"WS disconnected. Total: {len(self.active)}")

    async def broadcast(self, data: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            try:
                self.active.remove(ws)
            except ValueError:
                pass


manager = ConnectionManager()


# ── Background sensor loop ───────────────────────────────────────────────────
async def sensor_loop():
    global _latest_readings, _latest_kpis, _active_alerts

    while True:
        interval = max(0.5, 3.0 / _sim_speed)
        await asyncio.sleep(interval)

        raw_readings = generate_all_readings()
        enriched = []

        for r in raw_readings:
            anomaly_result = detect(r["machine"], r)
            r["is_anomaly"]     = bool(anomaly_result["is_anomaly"])
            r["anomaly_score"]  = float(anomaly_result["anomaly_score"])
            r["affected_metric"] = str(anomaly_result.get("affected_metric", "none"))
            clean = sanitize_reading(r)
            enriched.append(clean)

            # Persist to DB
            await insert_reading(clean)

            # Generate alert if anomaly
            if clean["is_anomaly"] and clean["affected_metric"] != "none":
                severity = "critical" if clean["temperature"] > 110 or clean["vibration"] > 4.5 else "warning"
                alert = {
                    "timestamp":       clean["timestamp"],
                    "machine":         clean["machine"],
                    "affected_metric": clean["affected_metric"],
                    "severity":        severity,
                    "message": (
                        f"{clean['machine']}: anomaly detected on "
                        f"{clean['affected_metric']} "
                        f"(score={clean['anomaly_score']:.2f})"
                    ),
                }
                await insert_alert(alert)

        _latest_readings = enriched
        _latest_kpis     = process_readings(enriched)
        _active_alerts   = [sanitize_alert(a) for a in await get_alerts(limit=10)]

        payload = {
            "type":      "update",
            "readings":  enriched,
            "kpis":      _latest_kpis,
            "alerts":    _active_alerts,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await manager.broadcast(payload)


# ── App lifespan ─────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    task = asyncio.create_task(sensor_loop())
    logger.info("Sensor loop started.")
    yield
    task.cancel()


app = FastAPI(title="Smart Factory KPI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST Endpoints ───────────────────────────────────────────────────────────
@app.get("/api/live-data")
async def live_data():
    return {"readings": _latest_readings, "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/kpis")
async def kpis():
    return _latest_kpis or {"factory": {}, "machines": {}}


@app.get("/api/history")
async def history(hours: int = 24):
    data = await get_history(hours=hours)
    return {"history": data, "count": len(data)}


@app.get("/api/machines")
async def machines():
    return {"machines": _latest_readings}


@app.get("/api/alerts")
async def alerts():
    data = await get_alerts(limit=10)
    return {"alerts": [sanitize_alert(a) for a in data]}


class AnomalyRequest(BaseModel):
    machine: Optional[str] = None


@app.post("/api/trigger-anomaly")
async def trigger_anomaly(req: AnomalyRequest):
    import random as _random
    machine = req.machine or _random.choice(MACHINES)
    set_anomaly(machine, duration_ticks=20)
    return {"triggered": True, "machine": machine, "duration_ticks": 20}


class BalanceRequest(BaseModel):
    source_machine: str


@app.post("/api/balance-load")
async def balance_load_endpoint(req: BalanceRequest):
    if req.source_machine not in MACHINES:
        raise HTTPException(status_code=400, detail="Invalid machine")
    target = balance_load(req.source_machine)
    return {"balanced": True, "source": req.source_machine, "target": target}


class DismissRequest(BaseModel):
    alert_id: int


@app.post("/api/dismiss-alert")
async def dismiss(req: DismissRequest):
    await dismiss_alert(req.alert_id)
    return {"dismissed": True, "alert_id": req.alert_id}


class SpeedRequest(BaseModel):
    speed: int  # 1, 5, or 10


@app.post("/api/set-speed")
async def set_speed(req: SpeedRequest):
    global _sim_speed
    if req.speed not in (1, 5, 10):
        raise HTTPException(status_code=400, detail="Speed must be 1, 5, or 10")
    _sim_speed = req.speed
    return {"speed": _sim_speed}


# ── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Immediately push latest state on connect (all values already sanitized)
    if _latest_readings:
        try:
            await websocket.send_json({
                "type":      "update",
                "readings":  _latest_readings,
                "kpis":      _latest_kpis,
                "alerts":    _active_alerts,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        except Exception:
            pass
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

