

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Header = ({ onMobileMenuClick, darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-20 transition-colors duration-300">

      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
          onClick={onMobileMenuClick}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo (visible on mobile only, if sidebar is closed) */}
        <Link to="/" className="flex items-center space-x-2 lg:hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: "#003049" }}
          >
            D
          </div>
          <span className="text-xl font-bold text-[#003049] dark:text-white">
            DISMAT
          </span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto lg:ml-0">
            {/* Dark Mode Toggle */}
            <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Dark Mode"
            >
                {darkMode ? (
                    <span className="text-xl">☀️</span>
                ) : (
                    <span className="text-xl">🌙</span>
                )}
            </button>

          {user && (
            <div className="hidden md:flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                     <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                 </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
