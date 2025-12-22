"use client"

import { useState } from "react"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import GlassCard from "../components/ui/GlassCard"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post("/auth/login", { email, password })

      const { token, user } = res.data

      // Use context login action
      login(user, token)

      // Pending users
      if (user.status === "pending") {
        navigate("/pending", { replace: true })
        return
      }

      // Redirect by role
      // Redirect by role
      const role = user.role?.toLowerCase().trim();
      switch (role) {
        case "superadmin":
          navigate("/superadmin", { replace: true })
          break

        case "admin":
          navigate("/admin", { replace: true })
          break

        case "warehouse":
          navigate("/warehouse", { replace: true })
          break

        case "ngo":
          navigate("/ngo", { replace: true })
          break

        case "fieldworker":
          navigate("/fieldworker", { replace: true })
          break

        default:
          navigate("/", { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0f172a]">
       {/* Background Elements */}
       <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-blue-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
       </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
          >
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">
            DISMAT
          </h1>
          <p className="text-slate-400">Disaster Relief Material Tracking System</p>
        </div>

        {/* Login Card */}
        <GlassCard className="p-8" delay={0.2}>
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-2">
                 <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    Password
                 </label>
                 <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')} 
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                 >
                    Forgot Password?
                 </button>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-600"
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="font-bold text-white hover:text-blue-300 hover:underline transition-all ml-1"
              >
                Create Account
              </button>
            </p>
          </div>
        </GlassCard>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 font-mono">
          <p>Secure login for disaster relief coordination</p>
          <p className="mt-1">v2.4.0-stable</p>
        </div>
      </div>
    </div>
  )
}

export default Login
