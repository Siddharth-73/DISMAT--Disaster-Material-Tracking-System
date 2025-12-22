import React from "react";

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
    <div className="w-72 bg-[#003049] text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 shadow-2xl z-50">
      <div className="p-8 flex items-center gap-4 bg-gradient-to-r from-[#003049] to-[#024a6e] relative overflow-hidden">
        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner border border-white/20">
          🚀
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">DISMAT</h1>
          <div className="flex items-center gap-1.5 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
             <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group text-left relative overflow-hidden ${
              activeTab === item.id
                ? "bg-white text-[#003049] shadow-lg font-bold translate-x-1"
                : "text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
            }`}
          >
             {/* Active Indicator */}
             {activeTab === item.id && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#003049] rounded-r-full"></div>
             )}

            <span className={`text-xl transition-transform duration-300 ${activeTab === item.id ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
            </span>
            <span className="tracking-wide">{item.label}</span>
            
            {activeTab === item.id && (
                <span className="ml-auto text-[#003049] text-sm opacity-50">●</span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-100 bg-gradient-to-r from-red-600/20 to-red-600/10 hover:from-red-600 hover:to-red-500 hover:text-white rounded-xl transition-all duration-300 group shadow-sm hover:shadow-red-900/20"
        >
          <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
          <span className="font-semibold">Sign Out</span>
        </button>
        <p className="text-center text-[10px] text-blue-300/40 mt-4 font-mono">v2.4.0-stable</p>
      </div>
    </div>
  );
}
