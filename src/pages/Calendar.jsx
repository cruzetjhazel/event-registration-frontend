import { useState, useEffect } from "react"
import { Navbar } from "../components/Navbar"
import axios from "axios"

export const Calendar = ({ isAuthenticated = false }) => {
	const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 5))
	const [events, setEvents] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadEvents = async () => {
			setLoading(true)
			try {
				const apiBase = import.meta.env.VITE_API_BASE_URL || ""
				const { data } = await axios.get(`${apiBase}/api/events`)
				const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
				setEvents(list)
			} catch (err) {
				console.error("Failed to load events", err)
				setEvents([])
			} finally {
				setLoading(false)
			}
		}
		loadEvents()
	}, [])

	const getDaysInMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	}

	const getFirstDayOfMonth = (date) => {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
	}

	const getEventsForDate = (date) => {
		return events.filter((event) => {
			const eventDate = new Date(event.startsAt || event.starts_at)
			return (
				eventDate.getDate() === date.getDate() &&
				eventDate.getMonth() === date.getMonth() &&
				eventDate.getFullYear() === date.getFullYear()
			)
		})
	}

	const daysInMonth = getDaysInMonth(currentDate)
	const firstDay = getFirstDayOfMonth(currentDate)
	const days = []

	for (let i = 0; i < firstDay; i++) {
		days.push(null)
	}

	for (let i = 1; i <= daysInMonth; i++) {
		days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
	}

	const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

	const handlePrevMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
	}

	const handleNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
	}

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			<Navbar isAuthenticated={isAuthenticated} />

			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Event Calendar</h1>
					<p className="text-slate-600 dark:text-slate-400">Browse events by date</p>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Calendar */}
					<div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-white">{monthName}</h2>
							<div className="flex gap-2">
								<button
									onClick={handlePrevMonth}
									className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600"
									aria-label="Previous month"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={handleNextMonth}
									className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-600"
									aria-label="Next month"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>
						</div>

						{/* Weekday headers */}
						<div className="grid grid-cols-7 gap-2 mb-2">
							{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
								<div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-2">
									{day}
								</div>
							))}
						</div>

						{/* Calendar grid */}
						<div className="grid grid-cols-7 gap-2">
							{days.map((date, idx) => {
								const dayEvents = date ? getEventsForDate(date) : []
								const isToday =
									date &&
									date.toDateString() === new Date().toDateString()

								return (
									<div
										key={idx}
										className={`rounded-lg border p-3 min-h-24 text-sm ${
											!date
												? "bg-slate-50 dark:bg-slate-900 border-transparent"
												: isToday
												? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
												: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition"
										}`}
									>
										{date && (
											<>
												<p className={`font-semibold mb-1 ${isToday ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
													{date.getDate()}
												</p>
												{dayEvents.length > 0 && (
													<div className="space-y-1">
														{dayEvents.slice(0, 2).map((event, i) => (
															<div
																key={i}
																className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded px-2 py-1 truncate"
															>
																{event.title || "Event"}
															</div>
														))}
														{dayEvents.length > 2 && (
															<p className="text-xs text-slate-500 dark:text-slate-400">
																+{dayEvents.length - 2} more
															</p>
														)}
													</div>
												)}
											</>
										)}
									</div>
								)
							})}
						</div>
					</div>

					{/* Sidebar - Upcoming Events */}
					<div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg h-fit">
						<h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming</h3>
						{loading ? (
							<p className="text-sm text-slate-500">Loading...</p>
						) : events.length === 0 ? (
							<p className="text-sm text-slate-500 dark:text-slate-400">No events scheduled</p>
						) : (
							<div className="space-y-3">
								{events
									.sort((a, b) => new Date(a.startsAt || a.starts_at) - new Date(b.startsAt || b.starts_at))
									.slice(0, 5)
									.map((event) => (
										<div key={event.id} className="border-l-4 border-blue-500 pl-3 py-2">
											<p className="text-sm font-medium text-slate-900 dark:text-white truncate">
												{event.title}
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												{new Date(event.startsAt || event.starts_at).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}
											</p>
										</div>
									))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
