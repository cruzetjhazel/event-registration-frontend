import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { DashboardSidebar } from "../../components/DashboardSidebar"

const transformEvent = (item = {}) => {
	const startsAt = item.startsAt || item.starts_at || item.starts_at_utc
	const capacity = item.capacity ?? item.total_capacity ?? item.limit ?? 0
	const booked = item.booked ?? item.registrations_count ?? item.attendees ?? 0
	return {
		id: item.id ?? item._id ?? crypto.randomUUID?.() ?? String(Math.random()),
		title: item.title ?? item.name ?? "Untitled event",
		startsAt,
		capacity,
		booked,
		status: item.status ?? "pending",
	}
}

const StatCard = ({ label, value, hint }) => (
	<div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
		<p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
		<p className="mt-1 text-3xl font-bold text-white">{value}</p>
		{hint ? <p className="text-sm text-slate-300">{hint}</p> : null}
	</div>
)

export const AdminDashboard = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])
	const [events, setEvents] = useState([])
	const [metrics, setMetrics] = useState({ users: 0, events: 0, registrationsToday: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	const apiBase = useMemo(() => {
		const base = import.meta.env.VITE_API_BASE_URL ?? ""
		return base.endsWith("/") ? base.slice(0, -1) : base
	}, [])

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const load = async () => {
			setLoading(true)
			setError("")
			try {
				const [metricsRes, eventsRes] = await Promise.all([
					axios.get(`${apiBase}/api/admin/metrics`, { signal: controller.signal }),
					axios.get(`${apiBase}/api/admin/events`, { signal: controller.signal }),
				])

				if (!isMounted) return

				const metricData = metricsRes?.data ?? {}
				const eventsData = eventsRes?.data ?? []
				const list = Array.isArray(eventsData) ? eventsData : Array.isArray(eventsData?.data) ? eventsData.data : []

				setMetrics({
					users: metricData.total_users ?? 0,
					events: metricData.total_events ?? 0,
					registrationsToday: metricData.registrations_today ?? metricData.registrations_per_day ?? 0,
				})
				setEvents(list.map(transformEvent))
			} catch (err) {
				if (!isMounted || axios.isCancel(err)) return
				setError("Unable to load admin data.")
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		load()
		return () => {
			isMounted = false
			controller.abort()
		}
	}, [apiBase])

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
			<DashboardSidebar role="admin" />

			<div className="flex-1 lg:ml-64">
				<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12 text-slate-900 dark:text-white">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.18em] text-purple-200">Dashboard</p>
						<h1 className="text-3xl font-bold">Admin overview</h1>
					</div>
					<div className="flex flex-wrap gap-3">
						<Link
							to="/admin/approve-events"
							className="inline-flex items-center justify-center rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110"
						>
							Approve events
						</Link>
						<Link
							to="/admin/users"
							className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
						>
							Manage users
						</Link>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard label="Total users" value={metrics.users} />
					<StatCard label="Total events" value={metrics.events} />
					<StatCard label="Regs per day" value={metrics.registrationsToday} hint="Today" />
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Loading admin data…</div>
				)}

				{!loading && error && (
					<div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
				)}

				{!loading && !error && (
					<div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg backdrop-blur">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-white/10 text-sm">
								<thead className="bg-white/5 text-left text-slate-300">
									<tr>
										<th className="px-4 py-3">Title</th>
										<th className="px-4 py-3">Date</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Seats</th>
										<th className="px-4 py-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-white/5">
									{events.length === 0 && (
										<tr>
											<td colSpan={5} className="px-4 py-6 text-center text-slate-300">
												No events found.
											</td>
										</tr>
									)}
									{events.map((event) => {
										const date = (() => {
											const d = new Date(event.startsAt)
											if (Number.isNaN(d.getTime())) return "TBD"
											return new Intl.DateTimeFormat("en-US", {
												month: "short",
												day: "numeric",
												hour: "numeric",
												minute: "2-digit",
											}).format(d)
										})()

										const percent = event.capacity > 0 ? Math.min(Math.max((event.booked / event.capacity) * 100, 0), 100) : 0

										return (
											<tr key={event.id} className="text-slate-100">
												<td className="px-4 py-3 font-semibold">{event.title}</td>
												<td className="px-4 py-3 text-slate-300">{date}</td>
												<td className="px-4 py-3">
													<span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-purple-100">
														{event.status}
													</span>
												</td>
												<td className="px-4 py-3 text-slate-300">
													{event.booked}/{event.capacity || "∞"}
													<div className="mt-2 h-2 rounded-full bg-slate-800">
														<div
															className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500"
															style={{ width: `${percent}%` }}
														/>
													</div>
												</td>
												<td className="px-4 py-3 text-right">
													<div className="flex justify-end gap-2">
														<Link
															to={`/events/${event.id}/edit`}
															className="rounded-full border border-purple-300 px-3 py-1 text-xs font-semibold text-purple-100 transition hover:bg-purple-400/20"
														>
															Edit
														</Link>
														<button
															type="button"
															onClick={() => alert(`Delete ${event.title}`)}
															className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-500/10"
														>
															Delete
														</button>
													</div>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
				</div>
			</div>
		</div>
	)
}
