import React from "react";
import GlassCard from "../../components/ui/GlassCard"; // Ensure this path is correct relative to this file

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "pending", label: "Pending Approvals", icon: "⏳" },
    { id: "zones", label: "Disaster Zones", icon: "🌍" },
    { id: "categories", label: "Categories", icon: "🏷️" },
    { id: "warehouse", label: "Warehouses", icon: "🏭" },
  ];

  return (
    <div className="w-72 h-screen fixed left-0 top-0 bottom-0 z-50 flex flex-col glass-panel border-r border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="p-8 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 opacity-50"></div>
        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center font-bold text-2xl shadow-[inset_0_0_10px_rgba(255,255,255,0.1)] border border-white/10">
          🚀
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">DISMAT</h1>
          <div className="flex items-center gap-1.5 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
             <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 group text-left relative overflow-hidden ${
              activeTab === item.id
                ? "bg-white/10 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-white/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
             {/* Active Indicator */}
             {activeTab === item.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
             )}

            <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? "scale-110 text-blue-400" : "group-hover:scale-110 group-hover:text-blue-300"}`}>
                {item.icon}
            </span>
            <span className={`tracking-wide font-medium ${activeTab === item.id ? "text-white" : ""}`}>{item.label}</span>
            
            {activeTab === item.id && (
                 <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-300 bg-red-500/10 hover:bg-red-500/20 hover:text-red-200 border border-red-500/10 rounded-xl transition-all duration-300 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
          <span className="font-semibold">Sign Out</span>
        </button>
        <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">v2.4.0-stable</p>
      </div>
    </div>
  );
}
