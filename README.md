# 🏭 Smart Factory KPI Dashboard

A full-stack industrial monitoring application with simulated IoT sensor data, real-time KPI calculations, ML-based anomaly detection, and a beautiful dark-themed React dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11 + FastAPI |
| Database | SQLite (aiosqlite) |
| ML | scikit-learn IsolationForest |
| Real-time | WebSocket |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Dashboard: **http://localhost:5173**  
API Docs: **http://localhost:8000/docs**

## Features

- **4 simulated machines** (A/B/C/D) generating sensor data every 3s
- **KPIs**: OEE, Energy/Unit, Waste Rate, CO₂, Cost
- **Anomaly Detection**: IsolationForest ML model (trains on first 100 readings)
- **WebSocket streaming**: live data pushed to all connected clients
- **Trigger Anomaly button**: manually spikes a machine's temperature/vibration
- **Speed control**: 1× / 5× / 10× simulation speed
- **Machine detail modal**: click any row to drill into OEE breakdown
- **Generate Report**: summary popup with all KPIs and alerts

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/live-data` | Current readings for all machines |
| GET | `/api/kpis` | Calculated KPIs |
| GET | `/api/history?hours=24` | Historical data |
| GET | `/api/machines` | Machine status list |
| GET | `/api/alerts` | Active alerts |
| POST | `/api/trigger-anomaly` | Manually trigger anomaly |
| POST | `/api/set-speed` | Set simulation speed (1/5/10) |
| WS | `/ws/live` | Real-time WebSocket stream |

## Color Coding

| Color | Meaning |
|-------|---------|
| 🟢 Green | Good / OEE > 85% |
| 🟡 Yellow | Warning / OEE 65–85% |
| 🔴 Red | Critical / OEE < 65% or anomaly |
