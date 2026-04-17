import { useState } from "react";
import { Settings, Shield, HardDrive, Users, Save, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-enter max-w-5xl mx-auto space-y-6">
      
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             <Settings className="text-indigo-600" size={32} />
             System Configuration
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage factory parameters, access control, and diagnostic thresholds.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all"
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? "Saved Data" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Thresholds Panel */}
        <div className="col-span-2 glass bg-white p-6 rounded-2xl border border-slate-200">
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
             <Shield className="text-amber-500" size={20} />
             Anomaly Thresholds
           </h2>
           <div className="space-y-6">
             <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Temperature (°C)</label>
                  <input type="number" defaultValue={110} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Warning Temperature (°C)</label>
                  <input type="number" defaultValue={90} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-amber-400 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Critical Vibration (m/s²)</label>
                  <input type="number" step={0.1} defaultValue={4.5} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Degradation Threshold (%)</label>
                  <input type="number" defaultValue={75} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
               </div>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anomaly Simulation Duration (Ticks)</label>
                <div className="flex gap-4">
                   <input type="range" min={5} max={60} defaultValue={20} className="flex-1 accent-indigo-600" />
                   <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">20 Ticks</span>
                </div>
             </div>
           </div>
        </div>

        {/* Data Persistence */}
        <div className="col-span-1 glass bg-white p-6 rounded-2xl border border-slate-200">
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
             <HardDrive className="text-emerald-500" size={20} />
             Data Storage
           </h2>
           <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Database</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                  <option>SQLite (Local Mode)</option>
                  <option>InfluxDB (Time-series)</option>
                  <option>PostgreSQL</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">History Retention</label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50">
                  <option>30 Days</option>
                  <option>90 Days</option>
                  <option>1 Year</option>
                  <option>Indefinite</option>
                </select>
             </div>
             <button className="w-full mt-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
               Clear Historical Data
             </button>
           </div>
        </div>

        {/* User Management */}
        <div className="col-span-3 glass bg-white p-0 rounded-2xl border border-slate-200 overflow-hidden mt-2">
           <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 m-6 mb-4">
             <Users className="text-blue-500" size={20} />
             User Management
           </h2>
           <table className="w-full text-left">
             <thead className="bg-slate-50 border-y border-slate-200">
               <tr>
                 <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                 <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                 <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                 <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">admin</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold uppercase">Administrator</span></td>
                  <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 text-sm font-bold underline">Edit</button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">worker</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold uppercase">Operator</span></td>
                  <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</span></td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 text-sm font-bold underline">Edit</button>
                  </td>
                </tr>
             </tbody>
           </table>
           <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
              <button className="text-indigo-600 hover:text-indigo-800 font-bold text-sm">+ Add New User</button>
           </div>
        </div>

      </div>

    </div>
  );
}
