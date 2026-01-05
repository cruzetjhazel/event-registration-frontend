import axios from "axios"
import { useMemo, useState } from "react"
import { useTheme } from "../context/ThemeContext"

const roleRedirects = {
  user: "/dashboard/user",
  organizer: "/dashboard/organizer",
  admin: "/dashboard/admin",
}

export const Login = () => {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const apiBase = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? ""
    return base.endsWith("/") ? base.slice(0, -1) : base
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.")
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post(`${apiBase}/api/login`, { email, password })
      const role = data?.user?.role ?? data?.role
      const redirectTo = roleRedirects[role]

      if (!redirectTo) {
        setError("Login succeeded but no role was provided.")
        return
      }

      window.location.href = redirectTo
    } catch (err) {
      const message = err?.response?.data?.message ?? "Invalid credentials. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 p-3 shadow-lg transition hover:scale-110 border border-slate-200 dark:border-slate-700"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Left Side - Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-600 dark:from-purple-600 dark:via-fuchsia-600 dark:to-indigo-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="max-w-md">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Create & Manage Amazing Events
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of organizers and attendees in the ultimate event management platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Easy Event Creation</h3>
                  <p className="text-sm text-white/80">Set up your events in minutes with our intuitive interface</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-white/80">Track registrations and engagement instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Seamless Experience</h3>
                  <p className="text-sm text-white/80">Manage everything from one powerful dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-slate-600 dark:text-slate-400">Log in to manage your event experience</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-xl hover:shadow-purple-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
