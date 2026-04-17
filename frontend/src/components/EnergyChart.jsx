import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

const MACHINE_COLORS = {
  Machine_A: "#c084fc",  // pastel purple
  Machine_B: "#34d399",  // pastel green
  Machine_C: "#fbbf24",  // pastel amber
  Machine_D: "#38bdf8",  // pastel cyan
};
const MACHINES = ["Machine_A", "Machine_B", "Machine_C", "Machine_D"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const visible = payload.filter((p) => p.value != null);
  if (!visible.length) return null;
  return (
    <div className="chart-tooltip">
      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 6, fontWeight: 700 }}>{label}</p>
      {visible.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: p.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#475569", fontSize: 12, fontWeight: 600 }}>{p.name.replace("Machine_", "M-")}:</span>
          <span style={{ color: "#0f172a", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 800 }}>
            {p.value?.toFixed(2)} kWh
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EnergyChart({ liveBuffer, history }) {
  const chartData = useMemo(() => {
    const source = liveBuffer?.length ? liveBuffer : (history || []);
    if (!source.length) return [];

    const byTime = {};
    source.forEach((r) => {
      if (!r?.timestamp || !r?.machine || r.energy_kwh == null) return;
      const d   = new Date(r.timestamp);
      const key = d.toLocaleTimeString("en-US", { hour12: false });
      if (!byTime[key]) byTime[key] = { time: key };
      byTime[key][r.machine] = +r.energy_kwh.toFixed(3);
    });

    return Object.entries(byTime)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => row)
      .slice(-80);
  }, [liveBuffer, history]);

  const hasData = chartData.length > 0;

  const allVals = chartData.flatMap((d) => MACHINES.map((m) => d[m]).filter((v) => v != null));
  const minY = allVals.length ? +(Math.min(...allVals) - 1.5).toFixed(1) : 0;
  const maxY = allVals.length ? +(Math.max(...allVals) + 1.5).toFixed(1) : 30;

  return (
    <div className="glass h-full flex flex-col" style={{ padding: "20px 24px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 4 }}>
            ⚡ Energy Consumption
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            Real-time feed — {chartData.length} data points
            {chartData.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wide">
                ● live
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {MACHINES.map((m) => (
            <div key={m} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 24, height: 4, borderRadius: 2,
                backgroundColor: MACHINE_COLORS[m],
              }} />
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{m.replace("Machine_", "M-")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {hasData ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {MACHINES.map((m) => (
                  <linearGradient key={m} id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={MACHINE_COLORS[m]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={MACHINE_COLORS[m]} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                domain={[minY, maxY]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toFixed(0)}
              />
              <Tooltip content={<CustomTooltip />} />
              {MACHINES.map((m) => (
                <Area
                  key={m}
                  type="monotone"
                  dataKey={m}
                  name={m}
                  stroke={MACHINE_COLORS[m]}
                  strokeWidth={2.5}
                  fill={`url(#grad-${m})`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: MACHINE_COLORS[m] }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
              <div style={{ fontSize: 32 }} className="animate-pulse-soft">⚡</div>
              <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Awaiting sensor data…</p>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
