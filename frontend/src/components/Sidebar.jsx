"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  
  // Use pathname to determine active state more reliably
  const currentPath = location.pathname

  if (!user) return null

  // Define menu items based on dashboard (logic preserved)
  const getMenuItems = () => {
    if (currentPath.includes("/admin")) {
      return [
        { label: "NGO Requests", href: "#ngo-requests", icon: "📋" },
        { label: "Stock Availability", href: "#stock", icon: "📦" },
        { label: "Dispatch Tracking", href: "#dispatch", icon: "🚚" },
      ]
    } else if (currentPath.includes("/warehouse")) {
      return [
        { label: "Log Material Receipt", href: "#log-receipt", icon: "📝" },
        { label: "Stock Inventory", href: "#stock", icon: "📊" },
        { label: "Dispatch Tracking", href: "#dispatch", icon: "🚚" },
      ]
    } else if (currentPath.includes("/ngo")) {
      return [
        { label: "Create Request", href: "#create-request", icon: "➕" },
        { label: "Track Requests", href: "#track-requests", icon: "📍" },
        { label: "Dispatch Status", href: "#dispatch", icon: "🚚" },
      ]
    } else if (currentPath.includes("/fieldworker")) {
      return [
        { label: "Active Deliveries", href: "#deliveries", icon: "🚚" },
        { label: "Delivery History", href: "#history", icon: "📜" },
      ]
    }
    return []
  }

  const menuItems = getMenuItems()

  const handleSmoothScroll = (e, href) => {
    e.preventDefault()
    // If on mobile, close sidebar after click
    if (window.innerWidth < 1024 && onClose) {
        onClose();
    }
    
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <>
    {/* Sidebar Container */}
    <div 
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#003049] text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} dark:bg-slate-900 border-r border-white/5`}
    >
      {/* Premium Header with Gradient */}
      <div className="p-8 flex items-center gap-4 bg-gradient-to-r from-[#003049] to-[#024a6e] dark:from-slate-900 dark:to-slate-800 relative overflow-hidden shrink-0">
        <div className="relative z-10 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center font-bold text-2xl shadow-inner border border-white/20">
          🚀
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">DISMAT</h1>
          <div className="flex items-center gap-1.5 mt-1">
             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
             <p className="text-xs font-medium text-blue-200 uppercase tracking-widest">{user.role}</p>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => handleSmoothScroll(e, item.href)}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group text-left relative overflow-hidden text-blue-100 hover:bg-white/10 hover:text-white hover:translate-x-1"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                {item.icon}
            </span>
            <span className="tracking-wide font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="bg-white/5 rounded-xl p-4 mb-3 border border-white/5">
             <p className="text-sm font-semibold text-white truncate">{user.name}</p>
             <p className="text-xs text-blue-200 truncate">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-100 bg-red-600/20 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>

    </div>
    </>
  )
}

export default Sidebar
