import { useState } from "react";
import { Lock, User, CheckCircle2 } from "lucide-react";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const u = username.toLowerCase().trim();
    if (u === "admin") {
      onLogin("admin");
    } else if (u === "worker") {
      onLogin("worker");
    } else {
      setError("Please use 'admin' or 'worker' as username");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#e2e8f0]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-200 animate-slide-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Lock className="text-indigo-600" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Smart Factory</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Sign in to access dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                autoFocus
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors font-medium"
                placeholder="'admin' or 'worker'"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-slate-400" />
              </div>
              <input
                type="password"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors font-medium"
                placeholder="Any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all mt-6"
          >
            <CheckCircle2 size={18} />
            Secure Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 text-center uppercase tracking-widest mb-3">Demo Credentials</p>
          <div className="flex gap-2 justify-center">
             <button onClick={() => { setUsername('admin'); setPassword('admin'); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200">User: admin</button>
             <button onClick={() => { setUsername('worker'); setPassword('worker'); }} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200">User: worker</button>
          </div>
        </div>

      </div>
    </div>
  );
}
