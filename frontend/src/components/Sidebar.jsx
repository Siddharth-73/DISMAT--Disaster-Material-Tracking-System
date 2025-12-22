"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

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
    <AnimatePresence>
      {(isOpen || window.innerWidth >= 1024) && (
        <motion.div 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-obsidian/95 to-obsidian-foreground/95 backdrop-blur-2xl text-white shadow-2xl border-r border-white/5 flex flex-col`}
        >
          {/* Premium Header with Gradient */}
          <div className="p-8 flex items-center gap-4 relative overflow-hidden shrink-0 border-b border-white/5">
            <div className="relative z-10 w-12 h-12 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner border border-white/10 group">
              <span className="group-hover:scale-110 transition-transform duration-300">🚀</span>
            </div>
            <div className="relative z-10">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">DISMAT</h1>
              <div className="flex items-center gap-1.5 mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">{user.role}</p>
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none"></div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="group relative w-full flex items-center gap-4 px-5 py-4 rounded-xl text-slate-400 hover:text-white transition-all duration-300 overflow-hidden"
              >
                {/* Active/Hover Background */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 rounded-xl" />
                
                {/* Active Indicator Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 group-hover:h-8 transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100" />
                
                <span className="text-xl relative z-10 group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300">
                    {item.icon}
                </span>
                <span className="tracking-wide font-medium relative z-10 text-sm group-hover:translate-x-1 transition-transform duration-300">
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
            <div className="bg-white/5 rounded-xl p-4 mb-3 border border-white/5 backdrop-blur-sm">
                 <p className="text-sm font-semibold text-white truncate font-sans">{user.name}</p>
                 <p className="text-xs text-slate-400 truncate font-sans">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 rounded-xl transition-all duration-300 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Overlay for mobile */}
    {isOpen && window.innerWidth < 1024 && (
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         onClick={onClose}
         className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
       />
    )}
    </>
  )
}

export default Sidebar
