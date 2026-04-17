import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import KPICard from "./components/KPICard";
import EnergyChart from "./components/EnergyChart";
import MachineStatus from "./components/MachineStatus";
import WastePieChart from "./components/WastePieChart";
import CostBarChart from "./components/CostBarChart";
import AlertsPanel from "./components/AlertsPanel";
import MachineDetailModal from "./components/MachineDetailModal";
import ReportModal from "./components/ReportModal";
import LoginPage from "./components/LoginPage";
import SettingsPage from "./components/SettingsPage";
import { useLiveData } from "./hooks/useLiveData";
import { Wifi, WifiOff, Clock, AlertTriangle, FileText, ChevronRight, Filter, LogOut, X } from "lucide-react";

/* ── Light Top Header ─────────────────────────────────────────────────────── */
function Header({ connected, speed, onSpeedChange, onTriggerAnomaly, onGenerateReport, filterMachine, onFilterMachine, userRole, onLogout }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const isAdmin = userRole === "admin";

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shrink-0 z-40 transition-colors">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-indigo-600">Smart Factory</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-500">Dashboard</span>
      </div>

      {/* Center: controls */}
      <div className="flex items-center gap-4">
        {/* Machine Filter Dropdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
           <Filter size={14} className="text-slate-400" />
           <select 
             value={filterMachine} 
             onChange={(e) => onFilterMachine(e.target.value)}
             className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
           >
             <option value="all">All Machines</option>
             <option value="Machine_A">Machine A</option>
             <option value="Machine_B">Machine B</option>
             <option value="Machine_C">Machine C</option>
             <option value="Machine_D">Machine D</option>
           </select>
        </div>

        {/* Speed selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {[1, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                speed === s 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                  : "text-slate-500 hover:bg-slate-200/50"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={onTriggerAnomaly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors shadow-sm"
          >
            <AlertTriangle size={14} />
            Simulate Anomaly
          </button>
        )}

        {isAdmin && (
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <FileText size={14} />
            Report
          </button>
        )}
      </div>

      {/* Right: time + status + logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span className="text-sm font-mono font-medium text-slate-700">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
          connected ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          {connected ? "LIVE" : "OFFLINE"}
          {connected && <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{userRole}</span>
          <button onClick={onLogout} title="Logout" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Machine detail table row ────────────────────────────────────────────── */
function TableRow({ r, kpi, onClick }) {
  const oee = kpi?.oee ?? 0;
  const statusColors = { running: "text-emerald-600 bg-emerald-50 border-emerald-200", idle: "text-slate-600 bg-slate-50 border-slate-200", warning: "text-amber-600 bg-amber-50 border-amber-200", critical: "text-red-600 bg-red-50 border-red-200" };

  return (
    <tr
      onClick={onClick}
      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      <td className="px-4 py-3 text-sm font-bold text-slate-800">
        {r.machine.replace("_", " ")}
        {r.is_anomaly && <span className="ml-2 text-red-500">⚠</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase border ${statusColors[r.status] || statusColors.idle}`}>
          {r.status}
        </span>
      </td>
      <td className={`px-4 py-3 font-mono text-sm font-bold ${oee >= 85 ? "text-emerald-600" : oee >= 65 ? "text-amber-500" : "text-red-500"}`}>
        {oee.toFixed(1)}%
      </td>
      <td className={`px-4 py-3 font-mono text-sm ${r.temperature > 90 ? "text-amber-600 font-bold" : "text-slate-600"}`}>
        {r.temperature?.toFixed(1)}°C
      </td>
      <td className={`px-4 py-3 font-mono text-sm ${r.vibration > 2.8 ? "text-amber-600 font-bold" : "text-slate-600"}`}>
        {r.vibration?.toFixed(3)}
      </td>
      <td className="px-4 py-3 font-mono text-sm text-slate-600">{r.units_produced}</td>
      <td className="px-4 py-3 font-mono text-sm text-slate-600">{r.energy_kwh?.toFixed(3)}</td>
      <td className={`px-4 py-3 font-mono text-sm ${r.anomaly_score > 0.5 ? "text-red-500 font-bold" : "text-slate-400"}`}>
        {r.anomaly_score?.toFixed(3)}
      </td>
    </tr>
  );
}

/* ── Page: Overview ─────────────────────────────────────────────────────── */
function OverviewPage({ kpiData, readings, alarms, liveBuffer, history, onSelectMachine }) {
  return (
    <div className="page-enter flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Factory OEE"   value={kpiData.oee ?? 0}              unit="%"         metric="oee"            icon="📊" subtitle={`Avail × Perf × Quality`} />
        <KPICard title="Energy / Unit" value={kpiData.energy_per_unit ?? 0}  unit="kWh"       metric="energy_per_unit" icon="⚡" subtitle={`${kpiData.units_produced ?? 0} units total`} />
        <KPICard title="Waste Rate"    value={kpiData.waste_rate ?? 0}       unit="%"         metric="waste_rate"      icon="♻️" subtitle={`${kpiData.waste_kg?.toFixed(2) ?? 0} kg wasted`} />
        <KPICard title="CO₂ Footprint" value={kpiData.co2_kg ?? 0}           unit="kg"        metric="co2_kg"          icon="🌿" subtitle={`$${kpiData.cost_usd?.toFixed(4) ?? 0} cost`} />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 min-h-[300px]">
           <EnergyChart liveBuffer={liveBuffer} history={history} />
        </div>
        <div className="col-span-2 min-h-[300px]">
           <MachineStatus readings={readings} kpis={{}} onSelect={onSelectMachine} />
        </div>
      </div>

      <AlertsPanel alerts={alarms} onDismiss={() => {}} onBalanceLoad={() => {}} compact />
    </div>
  );
}

function GlobalCriticalToast({ alert, dismissAlert, balanceLoad }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      balanceLoad(alert.machine, alert.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [alert.machine, alert.id, balanceLoad]);

  return (
    <div className="bg-white border-2 border-red-200 rounded-xl shadow-2xl p-4 animate-slide-up flex flex-col gap-2 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>
       <div className="flex justify-between items-start">
         <div>
            <h3 className="text-red-600 font-black text-sm uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle size={14} /> CRITICAL ANOMALY</h3>
            <p className="text-slate-800 font-bold text-xs mt-1">{alert.machine?.replace("_", " ")} &middot; {alert.affected_metric}</p>
         </div>
         <button onClick={() => dismissAlert(alert.id)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
       </div>
       <p className="text-slate-500 text-xs">{alert.message}</p>
       <div className="flex gap-2 mt-1">
         <button
           onClick={() => balanceLoad(alert.machine, alert.id)}
           className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-colors border border-indigo-700"
         >
           Balance Load
         </button>
         <button
           onClick={() => balanceLoad(alert.machine, alert.id)}
           className="flex-1 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs py-2 rounded-lg transition-colors border border-indigo-200 shadow-sm"
         >
           Auto Balance
         </button>
       </div>
    </div>
  );
}

/* ── Root App ────────────────────────────────────────────────────────────── */
export default function App() {
  const [userRole, setUserRole] = useState(null);

  const {
    readings, kpis, alerts, history, liveBuffer,
    connected, lastUpdate,
    triggerAnomaly, dismissAlert, setSpeed, balanceLoad
  } = useLiveData();

  const [activePage,     setActivePage]     = useState("overview");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [speed,          setSpeedState]     = useState(1);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showReport,     setShowReport]     = useState(false);
  const [filterMachine,  setFilterMachine]  = useState("all");

  if (!userRole) {
    return <LoginPage onLogin={setUserRole} />;
  }

  const handleSpeedChange = (s) => { setSpeedState(s); setSpeed(s); };

  // Filter logic
  let displayReadings = readings;
  let displayBuffer   = liveBuffer;
  let displayHistory  = history;
  let displayKPIs     = kpis?.factory || {};
  let displayAlerts   = alerts;

  if (filterMachine !== "all") {
    displayReadings = readings.filter(r => r.machine === filterMachine);
    displayBuffer   = liveBuffer.map(r => ({ ...r, time: r.time, [filterMachine]: r[filterMachine] }));
    displayAlerts   = alerts.filter(a => a.machine === filterMachine);
    displayKPIs     = kpis?.machines?.[filterMachine] || {};
  } else {
    displayKPIs = kpis?.factory || {};
  }

  const pageProps = { 
    readings: displayReadings, 
    kpiData: displayKPIs, 
    alarms: displayAlerts, 
    liveBuffer: displayBuffer, 
    history: displayHistory 
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#e2e8f0]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        alertCount={alerts.length}
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        userRole={userRole}
      />

      {/* Global Floating Toast for Critical Alerts */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 w-80 max-w-[90vw]">
        {Array.from(new Map(displayAlerts.filter(a => a.severity === "critical").map(a => [a.machine, a])).values()).map(alert => (
          <GlobalCriticalToast 
            key={alert.id} 
            alert={alert} 
            dismissAlert={dismissAlert} 
            balanceLoad={balanceLoad} 
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        <Header
          connected={connected}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          onTriggerAnomaly={() => triggerAnomaly(filterMachine !== "all" ? filterMachine : null)}
          onGenerateReport={() => setShowReport(true)}
          filterMachine={filterMachine}
          onFilterMachine={setFilterMachine}
          userRole={userRole}
          onLogout={() => { setUserRole(null); setActivePage("overview"); }}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {activePage === "overview" && (
             <OverviewPage {...pageProps} onSelectMachine={setSelectedMachine} />
          )}

          {activePage === "production" && (
             <div className="page-enter flex flex-col gap-5">
               <div className="grid grid-cols-3 gap-4">
                 <div className="col-span-1 min-h-[300px]">
                   <WastePieChart readings={displayReadings} />
                 </div>
                 <div className="col-span-2 glass p-5">
                    <h2 className="text-sm font-bold text-slate-800 mb-1">📋 Machine Detail</h2>
                    <p className="text-xs text-slate-500 mb-4">Click a row for full history</p>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200">
                          {["Machine", "Status", "OEE", "Temp", "Vibr.", "Units", "kWh", "Anom."].map(h => (
                            <th key={h} className="pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayReadings.map(r => (
                          <TableRow key={r.machine} r={r} kpi={kpis?.machines?.[r.machine]} onClick={() => setSelectedMachine(r.machine)} />
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
             </div>
          )}

          {activePage === "energy" && (
             <div className="page-enter flex flex-col gap-5">
               <div className="grid grid-cols-3 gap-4">
                 <CostBarChart history={displayHistory} currentCost={displayKPIs.cost_usd} />
                 <div className="col-span-2 border border-blue-200 p-5 bg-blue-50/50 rounded-2xl flex flex-col items-center justify-center">
                    <h2 className="text-blue-800 font-bold mb-2">Energy breakdown metrics</h2>
                    <p className="text-blue-600 text-sm">Filtered by {filterMachine === "all" ? "Whole Factory" : filterMachine.replace("_", " ")}</p>
                 </div>
               </div>
               <div className="h-[340px]">
                 <EnergyChart liveBuffer={displayBuffer} history={displayHistory} />
               </div>
             </div>
          )}

          {activePage === "alerts" && (
             <div className="page-enter">
               <AlertsPanel alerts={displayAlerts} fullPage onDismiss={dismissAlert} onBalanceLoad={balanceLoad} />
             </div>
          )}

          {activePage === "reports" && userRole === "admin" && (
             <div className="page-enter flex items-center justify-center h-[60vh] glass bg-white">
                <div className="text-center">
                   <div className="text-5xl mb-4">📊</div>
                   <h2 className="text-xl font-bold text-slate-800 mb-2">Automated Reporting</h2>
                   <p className="text-slate-500 mb-6 max-w-sm mx-auto">Generate a complete PDF summary containing active KPIs, sensor hardware health, and historical alerts.</p>
                   <button 
                     onClick={() => setShowReport(true)}
                     className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-indigo-500/30"
                   >
                     Generate Report
                   </button>
                </div>
             </div>
          )}

          {activePage === "settings" && userRole === "admin" && (
             <SettingsPage />
          )}

        </main>
      </div>

      {showReport && userRole === "admin" && (
        <ReportModal readings={readings} kpiData={kpis?.factory} isOpen={showReport} onClose={() => setShowReport(false)} />
      )}
      {selectedMachine && readings.find(r => r.machine === selectedMachine) && (
        <MachineDetailModal 
           machine={selectedMachine} 
           reading={readings.find(r => r.machine === selectedMachine)} 
           kpiData={kpis?.machines?.[selectedMachine]}
           history={history}
           onClose={() => setSelectedMachine(null)} 
        />
      )}
    </div>
  );
}
