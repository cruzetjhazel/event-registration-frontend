import axios from "axios"
import { useMemo, useState } from "react"

const roleRedirects = {
  user: "/dashboard/user",
  organizer: "/dashboard/organizer",
  admin: "/dashboard/admin",
}

export const Login = () => {
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
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-center text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-slate-200">Log in to manage your event experience.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none ring-0 transition focus:border-emerald-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white outline-none ring-0 transition focus:border-emerald-400"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
