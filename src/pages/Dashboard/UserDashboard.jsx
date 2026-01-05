import api from "../../api/api"
import { useEffect, useMemo, useState } from "react"
import { DashboardSidebar } from "../../components/DashboardSidebar"
import { useCountdown } from "../../hooks/useCountdown"

const transformEvent = (item = {}) => {
	const startsAt = item.startsAt || item.starts_at || item.starts_at_utc
	return {
		id: item.id ?? item._id ?? crypto.randomUUID?.() ?? String(Math.random()),
		title: item.title ?? item.name ?? "Untitled event",
		startsAt,
		status: item.status ?? "registered",
	}
}

const StatusPill = ({ status }) => {
	const map = {
		registered: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
		waitlisted: "bg-amber-500/20 text-amber-100 border border-amber-400/40",
		full: "bg-slate-700 text-slate-100 border border-slate-500/40",
	}
	const tone = map[status] ?? map.registered
	return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{status}</span>
}

const EventRow = ({ event }) => {
	const countdown = useCountdown(event.startsAt)
	const formattedDate = (() => {
		const d = new Date(event.startsAt)
		if (Number.isNaN(d.getTime())) return "TBD"
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(d)
	})()

	return (
		<div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
			<div className="space-y-1">
				<p className="text-lg font-semibold text-white">{event.title}</p>
				<p className="text-sm text-slate-300">{formattedDate}</p>
				<StatusPill status={event.status} />
			</div>
			<div className="text-right">
				<p className="text-xs uppercase tracking-[0.12em] text-slate-400">Starts in</p>
				<p className="text-xl font-semibold text-white" aria-live="polite">{countdown.formatted}</p>
			</div>
		</div>
	)
}

export const UserDashboard = () => {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const load = async () => {
			setLoading(true)
			setError("")
			try {
				const { data } = await api.get(`/my-registrations`, { signal: controller.signal })
				if (!isMounted) return
				const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
				setEvents(list.map(transformEvent))
			} catch (err) {
				if (!isMounted || err.name === "CanceledError") return
				setError("Unable to load your registered events.")
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		load()
		return () => {
			isMounted = false
			controller.abort()
		}
	}, [])

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
			<DashboardSidebar role="user" />

			<div className="flex-1 lg:ml-64">
				<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12 text-slate-900 dark:text-white">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.18em] text-purple-200">Dashboard</p>
						<h1 className="text-3xl font-bold">Your registered events</h1>
					</div>
				</div>

				{loading && (
					<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Loading your events…</div>
				)}

				{!loading && error && (
					<div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
				)}

				{!loading && !error && events.length === 0 && (
					<div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-slate-300">
						You are not registered for any events yet.
					</div>
				)}

				{!loading && !error && events.length > 0 && (
					<div className="mt-6 space-y-4">
						{events.map((event) => (
							<EventRow key={event.id} event={event} />
						))}
					</div>
				)}
				</div>
			</div>
		</div>
	)
}
