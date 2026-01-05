import { useEffect, useState } from "react"
import { useCountdown } from "../hooks/useCountdown"
import api from "../api/api"

const SAMPLE_FEATURED_EVENTS = [
	{
		id: "evt-featured-001",
		title: "React Conf 2026",
		startsAt: "2026-02-15T10:00:00Z",
		location: "San Francisco, CA",
		capacity: 500,
		booked: 380,
		bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
		tags: ["React", "JavaScript", "Frontend"],
		status: "open",
	},
	{
		id: "evt-featured-002",
		title: "Web Design Summit",
		startsAt: "2026-02-20T14:00:00Z",
		location: "New York, NY",
		capacity: 300,
		booked: 245,
		bannerUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
		tags: ["Design", "UX/UI", "Web"],
		status: "open",
	},
	{
		id: "evt-featured-003",
		title: "DevOps Bootcamp",
		startsAt: "2026-02-10T09:00:00Z",
		location: "Austin, TX",
		capacity: 150,
		booked: 150,
		bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
		tags: ["DevOps", "Cloud", "Infrastructure"],
		status: "full",
	},
	{
		id: "evt-featured-004",
		title: "Python Deep Dive",
		startsAt: "2026-03-01T15:30:00Z",
		location: "Online",
		capacity: 1000,
		booked: 650,
		bannerUrl: "https://images.unsplash.com/photo-1516321318423-f06f70a504f0?auto=format&fit=crop&w=800&q=80",
		tags: ["Python", "Programming", "Backend"],
		status: "coming_soon",
	},
	{
		id: "evt-featured-005",
		title: "AI & Machine Learning Workshop",
		startsAt: "2026-02-25T11:00:00Z",
		location: "Boston, MA",
		capacity: 200,
		booked: 120,
		bannerUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
		tags: ["AI", "Machine Learning", "Data Science"],
		status: "open",
	},
	{
		id: "evt-featured-006",
		title: "Mobile App Development",
		startsAt: "2026-03-10T10:00:00Z",
		location: "Seattle, WA",
		capacity: 250,
		booked: 200,
		bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
		tags: ["Mobile", "iOS", "Android"],
		status: "open",
	},
	{
		id: "evt-featured-007",
		title: "Cloud Architecture Masterclass",
		startsAt: "2026-02-28T13:00:00Z",
		location: "Online",
		capacity: 400,
		booked: 350,
		bannerUrl: "https://images.unsplash.com/photo-1460925895917-afdab0c3dde4?auto=format&fit=crop&w=800&q=80",
		tags: ["AWS", "Cloud", "Architecture"],
		status: "open",
	},
	{
		id: "evt-featured-008",
		title: "Cybersecurity Summit",
		startsAt: "2026-03-15T09:30:00Z",
		location: "Washington, DC",
		capacity: 350,
		booked: 280,
		bannerUrl: "https://images.unsplash.com/photo-1555949519-f8fe68de6df0?auto=format&fit=crop&w=800&q=80",
		tags: ["Security", "Cybersecurity", "Protection"],
		status: "open",
	},
]

const EventStatusBadge = ({ status, booked, capacity }) => {
	const statusMap = {
		open: { label: "Open", color: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40" },
		coming_soon: { label: "Coming Soon", color: "bg-blue-500/20 text-blue-100 border border-blue-400/40" },
		sold_out: { label: "Sold Out", color: "bg-red-500/20 text-red-100 border border-red-400/40" },
		full: { label: "Sold Out", color: "bg-red-500/20 text-red-100 border border-red-400/40" },
	}

	let displayStatus = status || "open"
	if (booked && capacity && booked >= capacity) {
		displayStatus = "sold_out"
	}

	const statusConfig = statusMap[displayStatus] || statusMap.open

	return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.color}`}>{statusConfig.label}</span>
}

export const FeaturedEvents = ({ isAuthenticated = false }) => {
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadFeaturedEvents = async () => {
			setLoading(true)
			try {
				const { data } = await api.get("/events")
				const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
				setEvents(list.length > 0 ? list.slice(0, 8) : SAMPLE_FEATURED_EVENTS) // Show first 8 events or use samples
			} catch (err) {
				console.error("Failed to load events", err)
				setEvents(SAMPLE_FEATURED_EVENTS) // Use sample events on error
			} finally {
				setLoading(false)
			}
		}

		loadFeaturedEvents()
	}, [])

	const formatDateTime = (dateString) => {
		if (!dateString) return "TBD"
		const date = new Date(dateString)
		if (Number.isNaN(date.getTime())) return "TBD"
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date)
	}

	const EventCard = ({ event }) => {
		const countdown = useCountdown(event.startsAt || event.starts_at)
		const isSoldOut = event.booked && event.capacity && event.booked >= event.capacity

		return (
			<div className="group h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-xl backdrop-blur transition hover:shadow-2xl hover:border-blue-400/50 dark:hover:border-blue-400/50 overflow-hidden flex flex-col">
				{/* Banner Image */}
				<div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600/30 to-blue-600/30">
					<img
						src={
							event.bannerUrl ||
							"https://images.unsplash.com/photo-1540575467063-178f50002c4b?auto=format&fit=crop&w=600&q=80"
						}
						alt={event.title}
						className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

					{/* Status Badge */}
					<div className="absolute top-4 right-4">
						<EventStatusBadge status={event.status} booked={event.booked} capacity={event.capacity} />
					</div>

					{/* Countdown Badge */}
					{!isSoldOut && (
						<div className="absolute top-4 left-4 rounded-lg bg-black/40 backdrop-blur px-3 py-2 text-xs font-semibold text-white border border-white/20">
							<p className="text-[10px] uppercase tracking-wider text-white/70">Starts in</p>
							<p className="font-bold">{countdown.formatted}</p>
						</div>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 p-5 flex flex-col justify-between">
					<div className="space-y-3">
						{/* Date & Time */}
						<div className="flex items-center gap-2 text-xs text-slate-400">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							{formatDateTime(event.startsAt || event.starts_at)}
						</div>

						{/* Title */}
						<h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-200 transition">
							{event.title || "Event Title"}
						</h3>

						{/* Location */}
						<div className="flex items-center gap-2 text-sm text-slate-300">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span className="truncate">{event.location || event.venue || "Location TBD"}</span>
						</div>

						{/* Tags */}
						{event.tags && event.tags.length > 0 && (
							<div className="flex flex-wrap gap-2 pt-2">
								{event.tags.slice(0, 2).map((tag) => (
									<span
										key={tag}
										className="inline-block text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>

					{/* Capacity Bar */}
					{event.capacity && (
						<div className="pt-3 mt-3 border-t border-white/10">
							<div className="flex items-center justify-between text-xs mb-2">
								<span className="text-slate-400">Availability</span>
								<span className="text-slate-300 font-medium">
									{Math.max(0, event.capacity - (event.booked || 0))}/{event.capacity}
								</span>
							</div>
							<div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
									style={{
										width: `${Math.min(((event.booked || 0) / event.capacity) * 100, 100)}%`,
									}}
								/>
							</div>
						</div>
					)}
				</div>

				{/* CTA Button */}
				<div className="p-4 border-t border-white/10 bg-gradient-to-t from-slate-900/20 to-transparent">
					<button
						onClick={() => {
							if (!isAuthenticated) {
								window.location.href = "/login"
								return
							}
							window.location.href = `/event/${event.id}`
						}}
						disabled={isSoldOut}
						className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition duration-200 flex items-center justify-center gap-2 ${
							isSoldOut
								? "bg-slate-700 text-slate-400 cursor-not-allowed"
								: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
						}`}
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
						{isSoldOut ? "Sold Out" : isAuthenticated ? "View Details" : "Login to Register"}
					</button>
				</div>
			</div>
		)
	}

	return (
		<section className="py-16 px-4 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<div className="mb-12 text-center">
					<p className="text-sm uppercase tracking-[0.2em] text-blue-400 font-semibold mb-3">
						Discover & Register
					</p>
					<h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
						Upcoming Events
					</h2>
					<p className="text-lg text-slate-300 max-w-2xl mx-auto">
						Explore our curated selection of events and secure your spot today
					</p>
				</div>

				{/* Events Grid */}
				{loading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="h-96 rounded-2xl border border-white/10 bg-white/5 backdrop-blur animate-pulse"
							/>
						))}
					</div>
				) : events.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-12 text-center">
						<p className="text-slate-300 text-lg">No featured events available at the moment.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{events.map((event) => (
							<EventCard key={event.id} event={event} />
						))}
					</div>
				)}

				{/* View All CTA */}
				{events.length > 0 && (
					<div className="mt-12 text-center">
						<a
							href="/events"
							className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-blue-400/50 text-blue-300 font-semibold hover:bg-blue-500/10 transition"
						>
							Explore All Events
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</a>
					</div>
				)}
			</div>
		</section>
	)
}
