import { Home, Zap, Factory, Bell, BarChart2, Settings, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { id: "overview",    icon: Home,      label: "Overview",    color: "#3b82f6" },
  { id: "energy",      icon: Zap,       label: "Energy",      color: "#f59e0b" },
  { id: "production",  icon: Factory,   label: "Production",  color: "#10b981" },
  { id: "alerts",      icon: Bell,      label: "Alerts",      color: "#ef4444" },
  { id: "reports",     icon: BarChart2, label: "Reports",     color: "#8b5cf6" },
];

export default function Sidebar({ activePage, onNavigate, alertCount = 0, expanded, onToggle, userRole }) {
  const isAdmin = userRole === "admin";
  const visibleNavItems = NAV_ITEMS.filter(item => isAdmin || item.id !== "reports");

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 ease-out flex-shrink-0 bg-white"
      style={{
        width: expanded ? 220 : 72,
        borderRight: "1px solid #e2e8f0",
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-5 cursor-pointer select-none"
        onClick={onToggle}
        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{
            background: "#eff6ff",
            color: "#3b82f6",
            boxShadow: "0 2px 8px rgba(59,130,246,0.15)",
          }}
        >
          🏭
        </div>
        {expanded && (
          <div className="overflow-hidden animate-fade-in">
            <div className="text-sm font-bold text-slate-800 leading-tight">Smart Factory</div>
            <div className="text-xs text-slate-500 font-medium tracking-wide">KPI Dashboard</div>
          </div>
        )}
        {expanded && (
          <ChevronRight
            size={14}
            className="ml-auto text-slate-400 transition-transform duration-300"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-2 animate-fade-in mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Navigation
          </span>
        </div>
      )}

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {visibleNavItems.map(({ id, icon: Icon, label, color }) => {
          const isActive = activePage === id;
          return (
            <div
              key={id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(id)}
              title={!expanded ? label : undefined}
              style={{
                justifyContent: expanded ? "flex-start" : "center",
                padding: expanded ? "10px 14px" : "12px",
              }}
            >
              <div className="relative flex-shrink-0">
                <Icon
                  size={20}
                  style={{ color: isActive ? color : "#8c9bbc" }}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {id === "alerts" && alertCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white pulse-dot"
                    style={{ background: "#ef4444", fontSize: 9, fontWeight: 700, border: "2px solid #fff" }}
                  >
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </div>
              {expanded && (
                <span className="text-sm font-medium overflow-hidden whitespace-nowrap">
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="px-3 pb-4 mt-auto">
        {expanded && (
          <div
            className="px-3 py-3 rounded-xl mb-3 animate-fade-in"
            style={{ background: "#f8fafc", border: "1px solid #f1f5f9" }}
          >
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> All Systems Go
            </div>
          </div>
        )}
        {isAdmin && (
          <div
            className={`nav-item ${activePage === "settings" ? "active" : ""}`}
            onClick={() => onNavigate("settings")}
            style={{ justifyContent: expanded ? "flex-start" : "center", padding: expanded ? "10px 14px" : "12px" }}
            title={!expanded ? "Settings" : undefined}
          >
            <Settings size={18} strokeWidth={2} style={{ color: activePage === "settings" ? "#3b82f6" : "#8c9bbc", flexShrink: 0 }} />
            {expanded && <span className="text-sm font-medium">Settings</span>}
          </div>
        )}
      </div>
    </aside>
  );
}
