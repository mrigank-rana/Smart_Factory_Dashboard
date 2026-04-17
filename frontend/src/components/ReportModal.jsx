import { X, FileText, DownloadCloud, AlertTriangle } from "lucide-react";

export default function ReportModal({ isOpen, onClose, readings, kpiData }) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* 
        This is the actual print container. 
        It has a generic white background and scales to the page when @media print is active.
      */}
      <div
        id="printable-report"
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
        style={{
          border: "1px solid #e2e8f0"
        }}
      >
        {/* Header (hidden in print, but we could make a specific print header) */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Factory Performance Report</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Generated {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 print-hide">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
            >
              <DownloadCloud size={16} />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Executive Summary */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">
              Executive Summary
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Overall OEE", val: `${kpiData?.oee?.toFixed(1)}%` },
                { label: "Total Units", val: kpiData?.total_units },
                { label: "Energy Rate", val: `$${((kpiData?.total_energy || 0)*0.12).toFixed(2)} / hr` },
                { label: "Waste", val: `${kpiData?.total_waste?.toFixed(1)} kg` },
              ].map((m, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 mb-1">{m.label}</div>
                  <div className="text-2xl font-black text-slate-800">{m.val || "—"}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Sensor Hardware Analysis Table */}
          <section>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex justify-between items-end">
              <span>Sensor Hardware Analysis</span>
              <span className="text-xs text-slate-400 font-medium normal-case tracking-normal">Predictive maintenance schedule</span>
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3 text-center">Sensor Age</th>
                    <th className="px-4 py-3 text-right">Accuracy Match</th>
                    <th className="px-4 py-3">Hardware Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {readings.map((r) => {
                    const status = r.sensor_health?.status || "Good";
                    let badgeClass = "bg-green-100 text-green-700 border-green-200";
                    if (status === "Degraded") badgeClass = "bg-amber-100 text-amber-700 border-amber-200";
                    if (status === "Replace") badgeClass = "bg-red-100 text-red-700 border-red-200";

                    return (
                      <tr key={r.machine} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-800 font-bold">{r.machine.replace("_", " ")}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{r.sensor_health?.age_days || 0} days</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.sensor_health?.accuracy?.toFixed(1) || 100}%</td>
                        <td className="px-4 py-3">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeClass}`}>
                             {status === "Replace" && <AlertTriangle size={12} />}
                             {status.toUpperCase()}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!readings.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No sensor data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Further breakdowns could go here... */}

        </div>
      </div>
    </div>
  );
}
