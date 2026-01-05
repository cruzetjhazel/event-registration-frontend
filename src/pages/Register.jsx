import axios from "axios"
import { useMemo, useState } from "react"
import { setAuthToken } from "../api/api"
import { useTheme } from "../context/ThemeContext"

const roleRedirects = {
	attendee: "/dashboard/user",
	organizer: "/dashboard/organizer",
	admin: "/dashboard/admin",
}

// Map backend roles to frontend roles for consistency
const mapRole = (backendRole) => {
	if (backendRole === "attendee") return "user"
	return backendRole
}

export const Register = () => {
	const { theme, toggleTheme } = useTheme()

	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirm, setConfirm] = useState("")
	const [role, setRole] = useState("attendee")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const apiBase = useMemo(() => {
		const base = import.meta.env.VITE_API_BASE_URL ?? ""
		return base.endsWith("/") ? base.slice(0, -1) : base
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")

		if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
			setError("All fields are required.")
			return
		}

		if (password !== confirm) {
			setError("Passwords do not match.")
			return
		}

		setLoading(true)
		try {
			const { data } = await axios.post(`${apiBase}/api/register`, { name, email, password, role })

			const token = data?.token || data?.access_token
			if (!token) {
				setError("Registration succeeded but no token was returned.")
				return
			}

			// Persist token for subsequent calls
			setAuthToken(token)

			// Map backend role to frontend role (e.g., "attendee" → "user")
			const userRole = data?.user?.role ?? data?.role
			const mappedRole = mapRole(userRole)

			// Store mapped role in localStorage for route protection
			if (mappedRole) {
				localStorage.setItem("user_role", mappedRole)
			}

			const redirectTo = roleRedirects[userRole] ?? "/dashboard/user"
			window.location.href = redirectTo
		} catch (err) {
			const message = err?.response?.data?.message ?? "Unable to register. Please try again."
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
			{/* Theme Toggle Button */}
			<button
				onClick={toggleTheme}
				className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 p-3 shadow-lg transition hover:scale-110 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100"
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
				<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-800 dark:from-slate-900 dark:via-cyan-900 dark:to-emerald-800">
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
				</div>
				
				<div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
					<div className="max-w-md">
						<h2 className="text-5xl font-bold mb-6 leading-tight">
							Start Your Event Journey Today
						</h2>
						<p className="text-xl text-white/90 mb-8">
							Create your account and discover endless possibilities for events and networking.
						</p>
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
								</div>
								<div>
									<h3 className="font-semibold mb-1">Quick Registration</h3>
									<p className="text-sm text-white/80">Get started in seconds and explore events instantly</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
								</div>
								<div>
									<h3 className="font-semibold mb-1">Connect & Network</h3>
									<p className="text-sm text-white/80">Join a thriving community of event enthusiasts</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<div>
									<h3 className="font-semibold mb-1">Stay Updated</h3>
									<p className="text-sm text-white/80">Never miss out on events that matter to you</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Right Side - Register Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 dark:bg-slate-900/90 p-8">
				<div className="w-full max-w-md">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
						<p className="text-slate-700 dark:text-slate-300">Join to register, organize, or attend events</p>
					</div>

					<form className="space-y-5" onSubmit={handleSubmit}>
						<div className="space-y-3">
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300">I want to join as</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => setRole("attendee")}
									className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
										role === "attendee"
											? "border-teal-400 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-200"
											: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
									}`}
								>
									<svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									Attendee
								</button>
								<button
									type="button"
									onClick={() => setRole("organizer")}
									className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
										role === "organizer"
											? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-200"
											: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
									}`}
								>
									<svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Organizer
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="name">
								Full name
							</label>
							<input
								id="name"
								name="name"
								type="text"
								autoComplete="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
								placeholder="John Doe"
							/>
						</div>

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
								className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
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
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
								placeholder="••••••••"
							/>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirm">
								Confirm password
							</label>
							<input
								id="confirm"
								name="confirm"
								type="password"
								autoComplete="new-password"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
								className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
								placeholder="••••••••"
							/>
						</div>

						{error && (
							<div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-200">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:shadow-xl hover:shadow-teal-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{loading ? "Creating account..." : "Create account"}
						</button>

						<div className="text-center text-sm text-slate-600 dark:text-slate-400">
							Already have an account?{" "}
							<a href="/login" className="font-medium text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200">
								Sign in
							</a>
						</div>

						<a href="/" className="block w-full text-center rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800">
							Back to Home
						</a>
					</form>
				</div>
			</div>
		</div>
	)
}
