"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/axios"
import GlassCard from "../components/ui/GlassCard"

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("ngo")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Full name is required")
      return
    }
    if (!email.trim()) {
      setError("Email is required")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      })
      // Could show a success modal here, but alert is fine for MVP + redirect
      // For Obsidian, ideally replace alert with a nice toast or state message, but keeping logic same for now.
      alert("Signup successful! Please check your email to verify your account before logging in.")
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
       {/* Background Elements */}
       <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-20%] w-[70%] h-[70%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[120px]"></div>
       </div>

      <div className="w-full max-w-md relative z-10">
        <GlassCard className="p-8" delay={0.1}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30">
              <h1 className="text-xl font-bold text-white tracking-widest">DISMAT</h1>
            </div>
            <p className="text-slate-400 text-sm mb-2">Disaster Relief Material Tracking System</p>
            <h2 className="text-3xl font-bold text-white mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Create Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                placeholder="Minimum 8 characters"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="admin" className="bg-slate-800">Admin</option>
                <option value="warehouse" className="bg-slate-800">Warehouse Manager</option>
                <option value="ngo" className="bg-slate-800">NGO / Volunteer</option>
                <option value="fieldworker" className="bg-slate-800">Field Worker</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-bold text-white hover:text-blue-300 hover:underline transition-colors ml-1"
              >
                Log in
              </button>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
