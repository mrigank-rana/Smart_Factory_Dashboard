/**
 * useLiveData.js
 * WebSocket hook with auto-reconnect + REST polling fallback.
 * Also maintains a rolling liveBuffer of recent readings for charts.
 */

import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:8000/ws/live";
const REST_BASE = "http://localhost:8000/api";
const RECONNECT_DELAY = 3000;
const LIVE_BUFFER_MAX = 300; // keep last 300 ticks × 4 machines = rich chart history

export function useLiveData() {
  const [readings, setReadings]       = useState([]);
  const [kpis, setKpis]               = useState({ factory: {}, machines: {} });
  const [alerts, setAlerts]           = useState([]);
  const [history, setHistory]         = useState([]);
  const [liveBuffer, setLiveBuffer]   = useState([]); // rolling per-reading history
  const [connected, setConnected]     = useState(false);
  const [lastUpdate, setLastUpdate]   = useState(null);

  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const liveBufferRef  = useRef([]);   // mutable ref to avoid stale closures

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/history?hours=24`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (_) {}
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "update") {
          const newReadings = msg.readings || [];

          setReadings(newReadings);
          setKpis(msg.kpis || { factory: {}, machines: {} });
          setAlerts(msg.alerts || []);
          setLastUpdate(new Date(msg.timestamp));

          // ── Accumulate rolling live buffer ──────────────────────────────
          if (newReadings.length > 0) {
            liveBufferRef.current = [
              ...liveBufferRef.current,
              ...newReadings,
            ].slice(-LIVE_BUFFER_MAX * 4); // 4 machines
            setLiveBuffer([...liveBufferRef.current]);
          }
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    fetchHistory();
    const histTimer = setInterval(fetchHistory, 60000);
    return () => {
      wsRef.current?.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      clearInterval(histTimer);
    };
  }, [connect, fetchHistory]);

  const triggerAnomaly = useCallback(async (machine = null) => {
    try {
      await fetch(`${REST_BASE}/trigger-anomaly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine }),
      });
    } catch (e) {
      console.error("triggerAnomaly failed:", e);
    }
  }, []);

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await fetch(`${REST_BASE}/dismiss-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alert_id: alertId }),
      });
    } catch (_) {}
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  const balanceLoad = useCallback(async (machine, alertId = null) => {
    try {
      await fetch(`${REST_BASE}/balance-load`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_machine: machine }),
      });
      if (alertId) {
        dismissAlert(alertId);
      }
    } catch (e) {
      console.error("balanceLoad failed:", e);
    }
  }, [dismissAlert]);

  const setSpeed = useCallback(async (speed) => {
    try {
      await fetch(`${REST_BASE}/set-speed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed }),
      });
    } catch (_) {}
  }, []);

  return {
    readings, kpis, alerts, history, liveBuffer,
    connected, lastUpdate,
    triggerAnomaly, dismissAlert, setSpeed, balanceLoad,
  };
}
