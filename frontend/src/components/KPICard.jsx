import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Light pastel theme mappings
const PASTEL_THEMES = {
  purple: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
  blue:   { bg: "#e0f2fe", text: "#0369a1", border: "#bae6fd" },
  pink:   { bg: "#fce7f3", text: "#be185d", border: "#fbcfe8" },
  green:  { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" },
};

const METRIC_CONFIG = {
  oee:             { theme: PASTEL_THEMES.purple, invert: false },
  energy_per_unit: { theme: PASTEL_THEMES.blue,   invert: true },
  waste_rate:      { theme: PASTEL_THEMES.pink,   invert: true },
  co2_kg:          { theme: PASTEL_THEMES.green,  invert: true },
};

export default function KPICard({ title, value, unit, metric, icon, subtitle, trend }) {
  const prevRef   = useRef(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value !== prevRef.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 400);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const cfg = METRIC_CONFIG[metric] || { theme: PASTEL_THEMES.purple, invert: false };
  const theme = cfg.theme;

  const displayVal = typeof value === "number"
    ? (Number.isInteger(value) ? value.toString() : value.toFixed(2))
    : "—";

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendGood = cfg.invert ? trend <= 0 : trend >= 0;
  const trendColor = trend === 0 ? "#6b7280" : trendGood ? "#16a34a" : "#dc2626";

  return (
    <div
      className="card-pastel card-hover relative overflow-hidden"
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }}
    >
      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: theme.text, opacity: 0.8 }}>
              {title}
            </p>
            {trend !== undefined && (
              <div
                 className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                 style={{ backgroundColor: "#ffffff80", color: trendColor, display: "inline-flex" }}
              >
                <TrendIcon size={12} />
                <span>{Math.abs(trend ?? 0).toFixed(1)}%</span>
              </div>
            )}
          </div>

          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-sm"
            style={{ backgroundColor: "#ffffff" }}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className={`flex items-baseline gap-1.5 mt-2 ${flash ? "value-flash" : ""}`}>
          <span
            className="text-4xl font-bold tracking-tight"
            style={{ color: theme.text, fontFamily: "Inter" }}
          >
            {displayVal}
          </span>
          <span className="text-sm font-semibold" style={{ color: theme.text, opacity: 0.7 }}>
            {unit}
          </span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs mt-3 font-medium flex items-center gap-2" style={{ color: theme.text, opacity: 0.7 }}>
             <span className="block w-full h-[3px] rounded-full overflow-hidden" style={{ background: theme.border }}>
                <span className="block h-full opacity-60 w-2/3" style={{ background: theme.text }}></span>
             </span>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
