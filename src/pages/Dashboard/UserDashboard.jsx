import { useMemo } from "react"
import { Link } from "react-router-dom"
import { Navbar } from "../../components/Navbar"

export const UserDashboard = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />
			<main className="mx-auto max-w-5xl px-4 py-12">
				<h1 className="text-3xl font-bold">User Dashboard</h1>
				<p className="mt-3 text-slate-200">Browse your registrations and upcoming events.</p>

				<div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
					<p className="text-slate-200">No registrations yet. Head back to events to register.</p>
					<Link
						to="/events"
						className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
					>
						Go to Events
					</Link>
				</div>
			</main>
		</div>
	)
}
