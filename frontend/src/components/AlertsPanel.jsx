import { useEffect } from "react";
import { X, AlertCircle, AlertTriangle, Info, Bell } from "lucide-react";

const SEV = {
  critical: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: <AlertCircle size={14} />, label: "CRITICAL" },
  warning:  { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: <AlertTriangle size={14} />, label: "WARNING" },
  info:     { color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd", icon: <Info size={14} />, label: "INFO" },
};

function AlertItem({ alert, onDismiss, onBalanceLoad }) {
  const cfg = SEV[alert.severity] || SEV.info;
  const timeStr = new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: false });

  // 5-second auto-timeout for critical alerts to safety trigger load balancing
  useEffect(() => {
    if (alert.severity === "critical" && onBalanceLoad) {
      const timer = setTimeout(() => {
        onBalanceLoad(alert.machine, alert.id);
      }, 5000); // 5 seconds timeout
      return () => clearTimeout(timer);
    }
  }, [alert.severity, alert.machine, alert.id, onBalanceLoad]);

  return (
    <div
      className="alert-item"
      style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "12px 14px", borderRadius: "14px",
        backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
        marginBottom: 10,
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}
    >
      <span style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{
            padding: "2px 8px", borderRadius: "8px", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em",
            backgroundColor: "#ffffff", border: `1px solid ${cfg.border}`, color: cfg.color,
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{alert.machine?.replace("_", " ")}</span>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>· {alert.affected_metric}</span>
        </div>
        <p style={{ fontSize: 12, color: "#475569", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {alert.message}
        </p>
        
        {(alert.severity === "critical" && onBalanceLoad) && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", marginBottom: "8px" }}>
            <button
               onClick={() => onBalanceLoad(alert.machine, alert.id)}
               style={{ backgroundColor: "#4f46e5", color: "white", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "6px", border: "1px solid #4338ca", cursor: "pointer" }}
               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
            >
               Balance Load
            </button>
            <button
               onClick={() => onBalanceLoad(alert.machine, alert.id)}
               style={{ backgroundColor: "white", color: "#4f46e5", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "6px", border: "1px solid #4f46e5", cursor: "pointer" }}
               onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
               onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
            >
               Auto Balance
            </button>
          </div>
        )}

        <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "JetBrains Mono, monospace" }}>{timeStr}</span>
      </div>

      <button
        onClick={() => onDismiss(alert.id)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#94a3b8", padding: 6, borderRadius: "8px", flexShrink: 0,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.color = "#334155"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function AlertsPanel({ alerts, onDismiss, onBalanceLoad, compact, fullPage }) {
  const hasAlerts    = alerts?.length > 0;
  const criticalCount = alerts?.filter((a) => a.severity === "critical").length || 0;
  const height       = fullPage ? "none" : compact ? 180 : 280;

  return (
    <div className="glass shadow-sm" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`p-2 rounded-xl ${hasAlerts ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
             <Bell size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
              Active Alerts
              {hasAlerts && (
                <span style={{
                  marginLeft: 8, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  backgroundColor: criticalCount > 0 ? "#fee2e2" : "#fef3c7",
                  border: `1px solid ${criticalCount > 0 ? "#fca5a5" : "#fde68a"}`,
                  color: criticalCount > 0 ? "#dc2626" : "#d97706",
                }}>
                  {alerts.length}
                </span>
              )}
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2, fontWeight: 500 }}>Last 10 priority events</p>
          </div>
        </div>
        {criticalCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 12, fontWeight: 700 }}
               className="animate-pulse-soft bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", display: "inline-block" }} />
            {criticalCount} critical
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight: height, overflowY: "auto", paddingRight: 4 }}>
        {!hasAlerts ? (
          <div style={{ textAlign: "center", padding: "32px 0", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.8 }}>🎉</div>
            <p style={{ color: "#16a34a", fontSize: 14, fontWeight: 700 }}>All systems normal</p>
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 4, fontWeight: 500 }}>No operations requiring intervention</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={onDismiss} onBalanceLoad={onBalanceLoad} />
          ))
        )}
      </div>
    </div>
  );
}
