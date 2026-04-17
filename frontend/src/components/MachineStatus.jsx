import { Thermometer, Activity, Zap, CheckCircle } from "lucide-react";

const STATUS_CFG = {
  running:  { color: "#16a34a", bg: "#dcfce7", border: "#bbf7d0", label: "Running"  },
  idle:     { color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0", label: "Idle"     },
  warning:  { color: "#d97706", bg: "#fef3c7", border: "#fde68a", label: "Warning"  },
  critical: { color: "#dc2626", bg: "#fee2e2", border: "#fecaca", label: "Critical" },
};

const MACHINE_EMOJIS = { Machine_A: "⚙️", Machine_B: "🔧", Machine_C: "🏗️", Machine_D: "🔩" };

function MachineCard({ reading, kpiData, onClick }) {
  const s     = STATUS_CFG[reading?.status] || STATUS_CFG.idle;
  const oee   = kpiData?.oee ?? 0;
  const anomaly = reading?.is_anomaly;

  return (
    <div
      onClick={onClick}
      className="glass-2 card-hover cursor-pointer relative overflow-hidden"
      style={{
        border: anomaly ? "2px solid #ef4444" : `1px solid #e2e8f0`,
        boxShadow: anomaly ? "0 4px 16px rgba(239,68,68,0.2)" : "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Anomaly glow ring */}
      {anomaly && (
        <div
          className="absolute inset-0 rounded-[14px] pointer-events-none animate-pulse-soft"
          style={{ border: "2px solid rgba(239,68,68,0.3)" }}
        />
      )}

      <div style={{ padding: "16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{MACHINE_EMOJIS[reading?.machine] || "🏭"}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b", lineHeight: 1.2 }}>
                {reading?.machine?.replace("_", " ")}
              </div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2, letterSpacing: "0.02em" }}>
                {anomaly ? "⚠ ANOMALY" : s.label.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Status indicator */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 20,
              backgroundColor: anomaly ? "#fef2f2" : s.bg,
              border: `1px solid ${anomaly ? "#fca5a5" : s.border}`,
              fontSize: 10, fontWeight: 800,
              color: anomaly ? "#dc2626" : s.color,
            }}
          >
            <span
              className={anomaly ? "pulse-dot" : ""}
              style={{
                width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                backgroundColor: anomaly ? "#dc2626" : s.color,
              }}
            />
            {s.label.toUpperCase()}
          </div>
        </div>

        {/* OEE bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>OEE Metric</span>
            <span style={{
              fontSize: 12, fontWeight: 800, fontFamily: "Inter, sans-serif",
              color: oee >= 85 ? "#16a34a" : oee >= 65 ? "#d97706" : "#dc2626"
            }}>
              {oee.toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                height: "100%", borderRadius: 3,
                width: `${Math.min(100, oee)}%`,
                backgroundColor: oee >= 85 ? "#10b981" : oee >= 65 ? "#f59e0b" : "#ef4444",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>

        {/* Metrics grid 2x2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { icon: <Thermometer size={12} />, label: "Temp", value: `${reading?.temperature?.toFixed(1)}°C`, warn: reading?.temperature > 90, crit: reading?.temperature > 110 },
            { icon: <Activity size={12} />,    label: "Vibr", value: `${reading?.vibration?.toFixed(2)}`, warn: reading?.vibration > 2.8, crit: reading?.vibration > 4.5 },
            { icon: <Zap size={12} />,         label: "kWh",  value: `${reading?.energy_kwh?.toFixed(2)}` },
            { icon: <CheckCircle size={12} />, label: "Units", value: reading?.units_produced ?? "—" },
          ].map(({ icon, label, value, warn, crit }) => (
            <div
              key={label}
              style={{
                backgroundColor: "#f8fafc", borderRadius: 10, padding: "8px 10px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", marginBottom: 2 }}>
                {icon}
                <span style={{ fontSize: 11, fontWeight: 700 }}>{label}</span>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 800, fontFamily: "Inter, sans-serif",
                color: crit ? "#dc2626" : warn ? "#d97706" : "#1e293b",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MachineStatus({ readings, kpis, onSelect }) {
  return (
    <div className="glass h-full" style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>🏭 Machine Health</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
          Real-time status — click card to drill down
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {readings.map((r) => (
          <MachineCard
            key={r.machine}
            reading={r}
            kpiData={kpis?.machines?.[r.machine]}
            onClick={() => onSelect?.(r.machine)}
          />
        ))}
        {!readings.length && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>
            ⏳ Waiting for sensor data…
          </div>
        )}
      </div>
    </div>
  );
}
