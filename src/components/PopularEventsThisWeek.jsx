import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../api/api"

const SAMPLE_POPULAR_EVENTS = [
	{
		id: "popular-001",
		title: "React Summit 2026",
		organizer: "TechCon Global",
		startsAt: "2026-01-10T10:00:00Z",
		registered: 1240,
		bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "popular-002",
		title: "Next.js Master Class",
		organizer: "Vercel Community",
		startsAt: "2026-01-12T14:00:00Z",
		registered: 856,
		bannerUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "popular-003",
		title: "Web3 & Blockchain Week",
		organizer: "Crypto Academy",
		startsAt: "2026-01-08T09:00:00Z",
		registered: 2156,
		bannerUrl: "https://images.unsplash.com/photo-1516321318423-f06f70a504f0?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "popular-004",
		title: "AI Art Creation Workshop",
		organizer: "AI Creators Lab",
		startsAt: "2026-01-15T15:30:00Z",
		registered: 945,
		bannerUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "popular-005",
		title: "Cloud Infrastructure Summit",
		organizer: "Cloud Experts",
		startsAt: "2026-01-11T11:00:00Z",
		registered: 1567,
		bannerUrl: "https://images.unsplash.com/photo-1460925895917-afdab0c3dde4?auto=format&fit=crop&w=800&q=80",
	},
]

export const PopularEventsThisWeek = ({ isAuthenticated = false }) => {
	const [events, setEvents] = useState(SAMPLE_POPULAR_EVENTS)
	const [loading, setLoading] = useState(false)
	const [hoveredId, setHoveredId] = useState(null)
	const navigate = useNavigate()

	useEffect(() => {
		const loadEvents = async () => {
			try {
				setLoading(true)
				const { data } = await api.get("/events")
				const eventList = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
				const filteredEvents = eventList
					.filter((event) => {
						const eventDate = new Date(event.startsAt || event.starts_at)
						const now = new Date()
						const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
						return eventDate >= now && eventDate <= weekFromNow
					})
					.slice(0, 5)
					.map((event) => ({
						id: event.id,
						title: event.title || "Untitled Event",
						organizer: event.organizer || "Event Organizer",
						startsAt: event.startsAt || event.starts_at,
						registered: event.registered || Math.floor(Math.random() * 2000) + 500,
						bannerUrl: event.bannerUrl || event.banner_url || SAMPLE_POPULAR_EVENTS[0].bannerUrl,
					}))

				setEvents(filteredEvents.length > 0 ? filteredEvents : SAMPLE_POPULAR_EVENTS)
			} catch (err) {
				console.error("Failed to load popular events:", err)
				setEvents(SAMPLE_POPULAR_EVENTS)
			} finally {
				setLoading(false)
			}
		}

		loadEvents()
	}, [])

	const formatDate = (dateString) => {
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

	const handleCardClick = (eventId) => {
		navigate(`/event/${eventId}`)
	}

	return (
		<section className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
			{/* Background gradient */}
			<div className="absolute inset-0 -z-20 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 opacity-50" />

			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
						Popular Events This Week
					</h2>
					<p className="text-slate-300 text-base max-w-2xl mx-auto">
						Discover trending events and join thousands of attendees
					</p>
				</div>

				{/* Events Grid */}
				{loading ? (
					<div className="flex justify-center items-center h-96">
						<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 place-items-center">
								{events.map((event, index) => {
									const isCenterCard = events.length > 2 && index === Math.floor(events.length / 2)
									const isHovered = hoveredId === event.id

									return (
										<div
											key={event.id}
											className={`
												relative group cursor-pointer transition-all duration-500 ease-out
												${isCenterCard ? "lg:scale-110 lg:z-10" : ""}
												${isHovered ? "scale-105" : "scale-100"}
											`}
											onMouseEnter={() => setHoveredId(event.id)}
											onMouseLeave={() => setHoveredId(null)}
											onClick={() => handleCardClick(event.id)}
										>
											{/* Glow effect */}
											<div
												className={`
													absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
													opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl
													${isHovered ? "scale-110" : "scale-100"}
												`}
											/>

											{/* Card Container */}
											<div
												className={`
													relative h-full rounded-2xl overflow-hidden
													bg-gradient-to-br from-slate-800/40 via-slate-800/30 to-slate-900/40
													backdrop-blur-xl border border-white/10 hover:border-purple-400/30
													transition-all duration-500 shadow-2xl
													${isHovered ? "shadow-purple-500/25 shadow-2xl" : "shadow-slate-900/50"}
												`}
											>
												{/* Banner Image */}
												<div className="relative h-48 overflow-hidden">
													<img
														src={event.bannerUrl}
														alt={event.title}
														className={`
															w-full h-full object-cover transition-transform duration-700
															${isHovered ? "scale-110" : "scale-100"}
														`}
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

													{/* Participant Badge */}
													<div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-semibold border border-white/20 shadow-lg">
														👥 {event.registered.toLocaleString()}
													</div>
												</div>

												{/* Content */}
												<div className="p-4">
													{/* Title */}
													<h3
														className={`
															text-lg font-bold text-white mb-2 line-clamp-2 transition-colors duration-300
															${isHovered ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400" : ""}
														`}
													>
														{event.title}
													</h3>

													{/* Organizer */}
													<p className="text-slate-400 text-xs mb-3 flex items-center">
														<span className="text-purple-400 mr-2">📋</span>
														{event.organizer}
													</p>

													{/* Date & Time */}
													<div className="flex items-center text-slate-300 text-xs mb-4 pb-4 border-b border-white/10">
														<span className="text-blue-400 mr-2">🕐</span>
														<span>{formatDate(event.startsAt)}</span>
													</div>

													{/* CTA Button */}
													<button
														className={`
															w-full py-2 rounded-lg font-semibold transition-all duration-300 text-sm
															bg-gradient-to-r from-blue-500 to-purple-500 text-white
															hover:shadow-lg hover:shadow-purple-500/50
															${isHovered ? "opacity-100 translate-y-0" : "opacity-90"}
														`}
													>
														View Event →
													</button>
												</div>

												{/* Corner accent */}
												<div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-3xl" />
											</div>
										</div>
									)
								})}
							</div>
				)}

				{/* Footer CTA */}
				<div className="text-center mt-12">
					<button
						onClick={() => navigate("/events")}
						className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
					>
						Explore All Events
					</button>
				</div>
			</div>
		</section>
	)
}
