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
		status: item.status ?? "draft",
	}
}

const StatCard = ({ label, value, hint }) => (
	<div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
		<p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
		<p className="mt-1 text-3xl font-bold text-white">{value}</p>
		{hint ? <p className="text-sm text-slate-300">{hint}</p> : null}
	</div>
)

const EventCard = ({ event }) => {
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
		<div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-sm font-semibold text-purple-200">{date}</p>
					<h3 className="text-lg font-bold text-white">{event.title}</h3>
					<p className="text-xs uppercase tracking-[0.12em] text-slate-400">{event.status}</p>
				</div>
				<Link
					to={`/events/${event.id}/edit`}
					className="rounded-full border border-purple-300 px-3 py-1 text-xs font-semibold text-purple-100 transition hover:bg-purple-400/20"
				>
					Edit
				</Link>
			</div>

			<div className="mt-4">
				<div className="flex items-center justify-between text-sm text-slate-200">
					<span>Seats</span>
					<span>
						{event.booked}/{event.capacity || "∞"}
					</span>
				</div>
				<div className="mt-2 h-2 rounded-full bg-slate-800">
					<div
						className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500"
						style={{ width: `${percent}%` }}
					/>
				</div>
				<p className="mt-2 text-xs text-slate-400">{Math.max(event.capacity - event.booked, 0)} seats left</p>
			</div>
		</div>
	)
}

export const OrganizerDashboard = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		startsAt: "",
		endsAt: "",
		location: "",
		capacity: "",
		tags: "",
	})
	const [formError, setFormError] = useState("")
	const [formLoading, setFormLoading] = useState(false)
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
				const { data } = await axios.get(`${apiBase}/api/me/organized-events`, { signal: controller.signal })
				if (!isMounted) return
				const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
				setEvents(list.map(transformEvent))
			} catch (err) {
				if (!isMounted || axios.isCancel(err)) return
				setError("Unable to load your events.")
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

	const handleFormChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const handleCreateEvent = async (e) => {
		e.preventDefault()
		setFormError("")

		if (!formData.title.trim() || !formData.description.trim() || !formData.startsAt || !formData.location.trim()) {
			setFormError("Title, description, date, and location are required.")
			return
		}

		const capacity = Number(formData.capacity)
		if (formData.capacity && capacity <= 0) {
			setFormError("Capacity must be a positive number.")
			return
		}

		setFormLoading(true)
		try {
			const payload = {
				title: formData.title,
				description: formData.description,
				starts_at: formData.startsAt,
				ends_at: formData.endsAt,
				location: formData.location,
				capacity: capacity || null,
				tags: formData.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean),
			}

			await axios.post(`${apiBase}/api/events`, payload)
			setShowCreateModal(false)
			setFormData({
				title: "",
				description: "",
				startsAt: "",
				endsAt: "",
				location: "",
				capacity: "",
				tags: "",
			})
			// Reload events
			window.location.reload()
		} catch (err) {
			const message = err?.response?.data?.message ?? "Unable to create event. Please try again."
			setFormError(message)
		} finally {
			setFormLoading(false)
		}
	}

	const totals = useMemo(() => {
		const totalEvents = events.length
		const upcoming = events.filter((evt) => {
			const d = new Date(evt.startsAt)
			return !Number.isNaN(d.getTime()) && d.getTime() > Date.now()
		}).length
		const capacitySum = events.reduce((acc, evt) => acc + (Number(evt.capacity) || 0), 0)
		const bookedSum = events.reduce((acc, evt) => acc + (Number(evt.booked) || 0), 0)
		return {
			totalEvents,
			upcoming,
			seatsFilled: bookedSum,
			seatsAvailable: Math.max(capacitySum - bookedSum, 0),
		}
	}, [events])

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
			<DashboardSidebar role="organizer" />

			<div className="flex-1 lg:ml-64">

			<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-white">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.18em] text-purple-200">Dashboard</p>
						<h1 className="text-3xl font-bold">Organizer overview</h1>
					</div>
					<div className="flex flex-wrap gap-3">
						<button
							onClick={() => setShowCreateModal(true)}
							className="inline-flex items-center justify-center rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110"
						>
							Create event
						</button>
						<Link
							to="/events"
							className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
						>
							View public
						</Link>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<StatCard label="Total events" value={totals.totalEvents} />
					<StatCard label="Upcoming" value={totals.upcoming} />
					<StatCard label="Seats filled" value={totals.seatsFilled} />
					<StatCard label="Seats available" value={totals.seatsAvailable} />
				</div>

				{loading && (
					<div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">Loading your events…</div>
				)}

				{!loading && error && (
					<div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
				)}

				{!loading && !error && events.length === 0 && (
					<div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-slate-300">
						You have not created any events yet. Start with a new event.
					</div>
				)}

				{!loading && !error && events.length > 0 && (
					<div className="mt-8 grid gap-4 sm:grid-cols-2">
						{events.map((event) => (
							<EventCard key={event.id} event={event} />
						))}
					</div>
				)}
			</div>

			{showCreateModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">
						<button
							onClick={() => setShowCreateModal(false)}
							className="absolute right-4 top-4 text-slate-400 transition hover:text-white"
						>
							<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>

						<h2 className="text-2xl font-bold text-white">Create new event</h2>
						<p className="mt-1 text-sm text-slate-400">Fill in the details to create a new event.</p>

						<form onSubmit={handleCreateEvent} className="mt-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-200">Event title *</label>
								<input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleFormChange}
									placeholder="e.g., Tech Conference 2024"
									className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:bg-white/10"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-200">Description *</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleFormChange}
									placeholder="Describe your event..."
									rows={3}
									className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:bg-white/10"
									required
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="block text-sm font-medium text-slate-200">Start date *</label>
									<input
										type="datetime-local"
										name="startsAt"
										value={formData.startsAt}
										onChange={handleFormChange}
										className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition focus:border-purple-400 focus:bg-white/10"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-200">End date</label>
									<input
										type="datetime-local"
										name="endsAt"
										value={formData.endsAt}
										onChange={handleFormChange}
										className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition focus:border-purple-400 focus:bg-white/10"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-200">Location *</label>
								<input
									type="text"
									name="location"
									value={formData.location}
									onChange={handleFormChange}
									placeholder="e.g., San Francisco Convention Center"
									className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:bg-white/10"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-200">Capacity</label>
								<input
									type="number"
									name="capacity"
									value={formData.capacity}
									onChange={handleFormChange}
									placeholder="Leave blank for unlimited"
									min="1"
									className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:bg-white/10"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-slate-200">Tags</label>
								<input
									type="text"
									name="tags"
									value={formData.tags}
									onChange={handleFormChange}
									placeholder="Comma-separated tags (e.g., tech, networking, conference)"
									className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 outline-none transition focus:border-purple-400 focus:bg-white/10"
								/>
							</div>

							{formError && (
								<div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{formError}</div>
							)}

							<div className="flex gap-3 pt-2">
								<button
									type="submit"
									disabled={formLoading}
									className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 font-semibold text-white shadow-lg shadow-purple-500/30 transition disabled:opacity-50 hover:brightness-110"
								>
									{formLoading ? "Creating..." : "Create event"}
								</button>
								<button
									type="button"
									onClick={() => setShowCreateModal(false)}
									className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			</div>
		</div>
	)
}
