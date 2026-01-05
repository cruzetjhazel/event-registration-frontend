import { useMemo } from "react"
import { Navigate } from "react-router-dom"

export const ProtectedRoute = ({ element, requiredRole }) => {
  const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])
  const userRole = useMemo(() => localStorage.getItem("user_role"), [])

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">
            Your role ({userRole || "unknown"}) does not have access to this dashboard.
          </p>
          <a href="/" className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold hover:bg-indigo-700">
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  // Authenticated and role matches
  return element
}
