import { useState } from "react";
import { X, Thermometer, Activity, Zap, CheckCircle, AlertCircle, HardDrive, ShieldAlert, Cpu, Settings2, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

const MACHINE_EMOJIS = { Machine_A: "⚙️", Machine_B: "🔧", Machine_C: "🏗️", Machine_D: "🔩" };

// Mock data specific to the Information Center upgrade
const IOT_SENSORS = {
  Temperature: {
    model: "PT100 Series RTD",
    protocol: "Modbus TCP",
    firmware: "v2.1.4",
  },
  Vibration: {
    model: "VibX Piezo Accelerometer",
    protocol: "IO-Link",
    firmware: "v1.0.8",
  },
  Energy: {
    model: "Schneider PM8000",
    protocol: "EtherNet/IP",
    firmware: "v4.5.1",
  }
};

const MAINTENANCE_LOGS = [
  { date: "2023-11-12", type: "Preventative", desc: "Lubricated main bearings and checked tension.", tech: "J. Smith" },
  { date: "2023-08-04", type: "Repair", desc: "Replaced faulty PT100 temperature probe.", tech: "A. Davis" },
  { date: "2023-01-22", type: "Calibration", desc: "Annual sensor calibration verified.", tech: "M. Lee" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-sm">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex gap-2 items-center text-slate-600">
           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
           {p.name}: <span className="font-mono font-bold text-indigo-600">{p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function MachineDetailModal({ machine, reading, kpiData, history, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!reading) return null;
  const oee = kpiData?.oee ?? 0;
  
  const statusColors = {
    running:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    idle:     "bg-slate-100 text-slate-600 border-slate-200",
    warning:  "bg-amber-100 text-amber-700 border-amber-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  }[reading.status] || "bg-slate-100 text-slate-600 border-slate-200";

  // Filter history strictly for this machine for the mini-chart
  const chartData = (history || []).filter(h => h.machine === machine).slice(-30).map(h => ({
    time: h.timestamp?.split("T")[1]?.substring(0, 8) || "",
    temp: h.temperature,
    vibration: h.vibration
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="bg-[#f4f6fa] border border-slate-200 shadow-2xl relative z-10 w-full max-w-6xl h-[85vh] rounded-3xl animate-slide-up flex flex-col overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Block */}
        <div className="bg-white px-8 py-6 border-b border-slate-200 flex-shrink-0 flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-4xl shadow-inner">
               {MACHINE_EMOJIS[machine] || "🏭"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-2xl font-black text-slate-800">{machine?.replace("_", " ")}</h2>
                 <span className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider ${statusColors}`}>
                   {reading.status}
                 </span>
                 {reading.is_anomaly && (
                   <span className="px-3 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-black animate-pulse flex items-center gap-1.5">
                     <AlertCircle size={14} /> ANOMALY
                   </span>
                 )}
              </div>
              <p className="text-slate-500 font-medium text-sm">Automated Assembly Unit // Zone Sector 4</p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white px-8 border-b border-slate-200 flex gap-6 shrink-0 pt-2">
           {[
             { id: "overview", label: "Live Overview", icon: <Activity size={16} /> },
             { id: "sensors",  label: "IoT Sensors & Hardware", icon: <Cpu size={16} /> },
             { id: "maintenance", label: "Service History", icon: <Settings2 size={16} /> }
           ].map(t => (
             <button
               key={t.id}
               onClick={() => setActiveTab(t.id)}
               className={`flex items-center gap-2 pb-4 pt-2 border-b-2 transition-all font-bold text-sm ${
                 activeTab === t.id 
                   ? "border-indigo-600 text-indigo-600" 
                   : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
               }`}
             >
               {t.icon}
               {t.label}
             </button>
           ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-fade-in space-y-6">
               
               {/* Top Metrics */}
               <div className="grid grid-cols-4 gap-4">
                 {[
                   { label: "Overall Equipment Effectiveness (OEE)", val: oee, sfx: "%", color: oee >= 85 ? "text-emerald-600" : "text-amber-500" },
                   { label: "Availability", val: kpiData?.availability ?? 0, sfx: "%", color: "text-slate-800" },
                   { label: "Performance", val: kpiData?.performance ?? 0, sfx: "%", color: "text-slate-800" },
                   { label: "Quality Pass Rate", val: kpiData?.quality ?? 0, sfx: "%", color: "text-slate-800" },
                 ].map((m, i) => (
                   <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{m.label}</div>
                      <div className={`text-3xl font-black font-mono tracking-tight ${m.color}`}>
                         {m.val.toFixed(1)}<span className="text-xl text-slate-400 ml-1">{m.sfx}</span>
                      </div>
                   </div>
                 ))}
               </div>

               {/* Real-time Telemetry & Chart */}
               <div className="grid grid-cols-3 gap-6">
                  
                  {/* Metric Readouts */}
                  <div className="col-span-1 grid grid-rows-3 gap-4">
                     {[
                       { icon: <Thermometer className="text-amber-500" />, label: "Core Temperature", value: `${reading.temperature?.toFixed(1)} °C`, warn: reading.temperature > 90 },
                       { icon: <Activity className="text-indigo-500" />, label: "Chassis Vibration", value: `${reading.vibration?.toFixed(3)} m/s²`, warn: reading.vibration > 2.8 },
                       { icon: <Zap className="text-yellow-500" />, label: "Energy Demand", value: `${reading.energy_kwh?.toFixed(2)} kWh`, warn: false },
                     ].map((m, i) => (
                       <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                             {m.icon}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</div>
                            <div className={`text-xl font-mono font-black ${m.warn ? "text-red-500" : "text-slate-800"}`}>
                              {m.value}
                            </div>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Micro Chart */}
                  <div className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Live Telemetry Trend</h3>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse-dot"></span> LIVE</span>
                     </div>
                     <div className="flex-1 min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="time" tick={{fontSize: 10, fill: "#94a3b8"}} axisLine={{stroke: "#e2e8f0"}} tickLine={false} />
                           <YAxis yAxisId="left" tick={{fontSize: 10, fill: "#94a3b8"}} axisLine={false} tickLine={false} domain={['auto','auto']} />
                           <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: "#94a3b8"}} axisLine={false} tickLine={false} domain={['auto','auto']} />
                           <RechartsTooltip content={<CustomTooltip />} />
                           <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp °C" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                           <Line yAxisId="right" type="monotone" dataKey="vibration" name="Vib m/s²" stroke="#6366f1" strokeWidth={2} dot={false} isAnimationActive={false} />
                         </LineChart>
                       </ResponsiveContainer>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* TAB: IOT SENSORS */}
          {activeTab === "sensors" && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                 <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                   <HardDrive className="text-indigo-600" size={20} /> Edge Device Inventory
                 </h3>
                 <div className="grid grid-cols-3 gap-6">
                    {/* Map IoT Configs */}
                    {Object.entries(IOT_SENSORS).map(([type, hw], idx) => {
                       // Use random degradation / the global health if we have it
                       const healthRaw = reading.sensor_health;
                       // We can mock per-sensor health based on the global machine health
                       const thisAccuracy = healthRaw ? Math.max(50, healthRaw.accuracy - (idx*1.2)) : 99.9;
                       
                       let statusBadge = <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-black uppercase">Optimal</span>;
                       if (thisAccuracy < 75) statusBadge = <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded text-[10px] font-black uppercase">Replace</span>;
                       else if (thisAccuracy < 85) statusBadge = <span className="px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded text-[10px] font-black uppercase">Degraded</span>;

                       return (
                         <div key={type} className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{type} Sensor</div>
                                 <div className="text-sm font-black text-slate-800 mt-1">{hw.model}</div>
                               </div>
                               {statusBadge}
                            </div>
                            
                            <div className="space-y-3 border-t border-slate-200 pt-3">
                               <div className="flex justify-between">
                                 <span className="text-xs text-slate-500 font-medium">Protocol</span>
                                 <span className="text-xs font-bold text-slate-700">{hw.protocol}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-xs text-slate-500 font-medium">Firmware</span>
                                 <span className="text-xs font-bold text-slate-700">{hw.firmware}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-xs text-slate-500 font-medium">Uptime Limit</span>
                                 <span className="text-xs font-bold text-slate-700">{healthRaw?.age_days || 0} / 350 days</span>
                               </div>
                               <div className="flex justify-between items-center">
                                 <span className="text-xs text-slate-500 font-medium">Calibration Match</span>
                                 <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                       <div className={`h-full ${thisAccuracy > 85 ? 'bg-emerald-500' : thisAccuracy > 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${thisAccuracy}%`}}></div>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-700">{thisAccuracy.toFixed(1)}%</span>
                                 </div>
                               </div>
                            </div>
                         </div>
                       )
                    })}
                 </div>

                 {/* Warning Block */}
                 {reading.sensor_health?.status === "Replace" && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4">
                       <ShieldAlert className="text-red-500 shrink-0" size={24} />
                       <div>
                         <h4 className="text-sm font-bold text-red-800">Attention Required: End of Lifecycle</h4>
                         <p className="text-xs text-red-600 mt-1 font-medium">One or more sensors on this machine have exceeded their reliable operating lifespan and calibration thresholds. Predictive maintenance flags suggest immediate sensor replacement to prevent false anomaly readings.</p>
                       </div>
                    </div>
                 )}
              </div>
            </div>
          )}

          {/* TAB: MAINTENANCE */}
          {activeTab === "maintenance" && (
            <div className="animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                   <Clock className="text-indigo-600" size={20} />
                   <h3 className="text-lg font-black text-slate-800">Service Activity History</h3>
                 </div>
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Activity Type</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MAINTENANCE_LOGS.map((m, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600">{m.date}</td>
                           <td className="px-6 py-4">
                             <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">{m.type}</span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-slate-700">{m.desc}</td>
                           <td className="px-6 py-4 text-sm font-bold text-slate-600">{m.tech}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
                 <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline">Load Older Records</button>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
