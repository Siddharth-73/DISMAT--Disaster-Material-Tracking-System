import { Navigate } from "react-router-dom"

export default function ProtectedRoute({ role, children }) {
  const storedUser = localStorage.getItem("user")
  const user = storedUser ? JSON.parse(storedUser) : null

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
