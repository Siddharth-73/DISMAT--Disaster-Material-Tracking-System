import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#003049] dark:border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Only redirect pending users IF they are still public
  if (user.status === "pending" && user.role === "public") {
    return <Navigate to="/pending" replace />
  }

  // Blocked users
  if (user.status === "blocked") {
    return <Navigate to="/login" replace />
  }

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return children
}
