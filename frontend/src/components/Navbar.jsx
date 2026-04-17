import { useState, useEffect } from "react";
import { Factory, Wifi, WifiOff, Clock } from "lucide-react";

export default function Navbar({ connected, speed, onSpeedChange, onTriggerAnomaly, onGenerateReport }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString("en-US", { hour12: false });
  const dateStr = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <nav className="glass-card sticky top-0 z-50 flex items-center justify-between px-6 py-3 mb-6 rounded-none border-x-0 border-t-0"
         style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-factory-blue/20 border border-factory-blue/40">
          <Factory size={22} className="text-factory-blue" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
            Smart Factory Dashboard
          </h1>
          <p className="text-xs text-factory-muted">Unified Industrial KPI Monitor</p>
        </div>
      </div>

      {/* Center: controls */}
      <div className="flex items-center gap-3">
        {/* Speed selector */}
        <div className="flex items-center gap-1 bg-factory-card border border-factory-border rounded-lg p-1">
          {[1, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                speed === s
                  ? "bg-factory-blue text-white"
                  : "text-factory-muted hover:text-white"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        <button
          onClick={onTriggerAnomaly}
          className="flex items-center gap-2 px-4 py-2 bg-factory-red/20 hover:bg-factory-red/30 border border-factory-red/40 text-factory-red text-xs font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
        >
          🚨 Trigger Anomaly
        </button>

        <button
          onClick={onGenerateReport}
          className="flex items-center gap-2 px-4 py-2 bg-factory-blue/20 hover:bg-factory-blue/30 border border-factory-blue/40 text-factory-blue text-xs font-semibold rounded-lg transition-all hover:scale-105 active:scale-95"
        >
          📊 Report
        </button>
      </div>

      {/* Right: time + connection */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-right">
          <Clock size={14} className="text-factory-muted" />
          <div>
            <div className="text-white font-mono font-semibold text-sm">{timeStr}</div>
            <div className="text-factory-muted text-xs">{dateStr}</div>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
          connected
            ? "bg-factory-green/10 border-factory-green/30 text-factory-green"
            : "bg-factory-red/10 border-factory-red/30 text-factory-red"
        }`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "LIVE" : "OFFLINE"}
          {connected && (
            <span className="w-1.5 h-1.5 rounded-full bg-factory-green pulse-dot" />
          )}
        </div>
      </div>
    </nav>
  );
}
