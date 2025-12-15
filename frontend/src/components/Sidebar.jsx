"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return null

  const currentPath = location.pathname

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
        { label: "Stock Management", href: "#stock", icon: "📦" },
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
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: "#003049" }}
          >
            D
          </div>
          <span className="text-2xl font-bold" style={{ color: "#003049" }}>
            DISMAT
          </span>
        </Link>
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-800">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                onClick={(e) => handleSmoothScroll(e, item.href)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-md group"
                style={{
                  color: "#003049",
                  "--hover-bg": "#003049",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#003049"
                  e.currentTarget.style.color = "white"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent"
                  e.currentTarget.style.color = "#003049"
                }}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: "#fdf0d5" }}>
          <p className="text-sm font-medium" style={{ color: "#003049" }}>
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-600 truncate">{user.email}</p>
        </div>
      </div>
    </div>
    </>
  )
}

export default Sidebar
