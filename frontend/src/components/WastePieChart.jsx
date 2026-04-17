import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

const WASTE_TYPES = [
  { key: "material", label: "Material Waste", color: "#fca5a5" }, // pastel red
  { key: "heat",     label: "Heat Loss",      color: "#fde047" }, // pastel yellow
  { key: "water",    label: "Water Waste",    color: "#7dd3fc" }, // pastel blue
  { key: "other",    label: "Other",          color: "#c084fc" }, // pastel purple
];
const PROPORTIONS = { material: 0.45, heat: 0.30, water: 0.15, other: 0.10 };

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="chart-tooltip">
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: item.payload.color, display: "inline-block", border: "1px solid rgba(0,0,0,0.1)" }} />
        {item.name}
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4, fontWeight: 500 }}>
        {item.value?.toFixed(2)} kg ({item.payload.pct?.toFixed(1)}%)
      </div>
    </div>
  );
}

function SliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }) {
  if (pct < 10) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#1e293b" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={800} fontFamily="Inter, sans-serif">
      {pct?.toFixed(0)}%
    </text>
  );
}

function CenterLabel({ cx, cy, totalWaste }) {
  if (!cx || !cy) return null;
  return (
    <g>
      <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="central"
        fill="#0f172a" fontSize={24} fontWeight={800} fontFamily="Inter, sans-serif">
        {totalWaste.toFixed(1)}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central"
        fill="#64748b" fontSize={12} fontWeight={600}>kg total</text>
    </g>
  );
}

export default function WastePieChart({ readings }) {
  const totalWaste = useMemo(
    () => readings.reduce((s, r) => s + (r.waste_kg || 0), 0),
    [readings]
  );

  const data = useMemo(
    () => WASTE_TYPES.map((t) => ({
      name: t.label,
      value: +(totalWaste * PROPORTIONS[t.key]).toFixed(3),
      color: t.color,
      pct: PROPORTIONS[t.key] * 100,
    })),
    [totalWaste]
  );

  return (
    <div className="glass" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b" }}>♻️ Waste Breakdown</h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
          This cycle:{" "}
          <span style={{ color: "#d97706", fontWeight: 700, backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: 8 }}>
            {totalWaste.toFixed(2)} kg
          </span>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={<SliceLabel />}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color}
                stroke="#ffffff"
                strokeWidth={2}
                style={{ filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.05))` }}
              />
            ))}
            <CenterLabel totalWaste={totalWaste} />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(v) => <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
