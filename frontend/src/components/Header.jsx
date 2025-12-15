

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Header = ({ onMobileMenuClick }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-md sticky top-0 z-20">

      <div className="px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={onMobileMenuClick}
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <span className="text-xl font-bold" style={{ color: "#003049" }}>
            DISMAT
          </span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto lg:ml-0">
          {user && (
            <>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#003049" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
