"""
database.py — SQLite setup using aiosqlite
Creates tables for sensor_readings and alerts.
"""

import aiosqlite
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "factory.db")


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp  TEXT    NOT NULL,
                machine    TEXT    NOT NULL,
                energy_kwh REAL,
                temperature REAL,
                vibration  REAL,
                units_produced INTEGER,
                waste_kg   REAL,
                status     TEXT,
                is_anomaly INTEGER DEFAULT 0,
                anomaly_score REAL DEFAULT 0.0
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp      TEXT    NOT NULL,
                machine        TEXT    NOT NULL,
                affected_metric TEXT,
                severity       TEXT,
                message        TEXT,
                dismissed      INTEGER DEFAULT 0
            )
        """)
        await db.commit()


async def insert_reading(reading: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO sensor_readings
              (timestamp, machine, energy_kwh, temperature, vibration,
               units_produced, waste_kg, status, is_anomaly, anomaly_score)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            reading["timestamp"],
            reading["machine"],
            reading["energy_kwh"],
            reading["temperature"],
            reading["vibration"],
            reading["units_produced"],
            reading["waste_kg"],
            reading["status"],
            int(reading.get("is_anomaly", False)),
            reading.get("anomaly_score", 0.0),
        ))
        await db.commit()


async def insert_alert(alert: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO alerts (timestamp, machine, affected_metric, severity, message)
            VALUES (?, ?, ?, ?, ?)
        """, (
            alert["timestamp"],
            alert["machine"],
            alert["affected_metric"],
            alert["severity"],
            alert["message"],
        ))
        await db.commit()


async def get_history(hours: int = 24):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT * FROM sensor_readings
            WHERE timestamp >= datetime('now', ?)
            ORDER BY timestamp ASC
        """, (f"-{hours} hours",))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_alerts(limit: int = 20):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT * FROM alerts
            WHERE dismissed = 0
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def dismiss_alert(alert_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE alerts SET dismissed = 1 WHERE id = ?", (alert_id,))
        await db.commit()
