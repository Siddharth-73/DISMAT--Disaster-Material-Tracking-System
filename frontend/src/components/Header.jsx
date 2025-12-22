
"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { motion } from "framer-motion"

const Header = ({ onMobileMenuClick, darkMode, toggleDarkMode }) => {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-obsidian/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-slate-300 transition-colors"
          onClick={onMobileMenuClick}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo (visible on mobile only) */}
        <Link to="/" className="flex items-center space-x-2 lg:hidden">
            <span className="text-xl font-bold text-white tracking-tight">DISMAT</span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto lg:ml-0">
            {/* Dark Mode Toggle */}
            <motion.button
                onClick={toggleDarkMode}
                layoutId="darkModeToggle"
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
                title="Toggle Dark Mode"
            >
                <motion.div
                    initial={false}
                    animate={{ rotate: darkMode ? 0 : 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                    {darkMode ? "☀️" : "🌙"}
                </motion.div>
            </motion.button>

          {user && (
            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                 <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-white font-sans">{user.name}</p>
                     <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{user.role}</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                    {user.name.charAt(0)}
                 </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
