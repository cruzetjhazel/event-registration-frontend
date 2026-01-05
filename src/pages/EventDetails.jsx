import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "../components/Navbar"
import { useCountdown } from "../hooks/useCountdown"

const FALLBACK_EVENT = {
	id: "evt-001",
	title: "Future of JavaScript Summit",
	startsAt: "2026-02-10T15:00:00Z",
	capacity: 320,
	booked: 180,
	location: "Pier 27, San Francisco, CA",
	organizer: "EventFlow Collective",
	tags: ["JavaScript", "Frontend", "Architecture"],
	description:
		"Deep dives into the next generation of JavaScript tooling, patterns, and performance. Expect hands-on labs, expert panels, and real-world case studies from top product teams.",
	bannerUrl:
		"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80",
}

export const EventDetails = () => {
	const { id } = useParams()
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	const [event, setEvent] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [status, setStatus] = useState("none") // none | registered | waitlisted

	const apiBase = useMemo(() => {
		const base = import.meta.env.VITE_API_BASE_URL ?? ""
		return base.endsWith("/") ? base.slice(0, -1) : base
	}, [])

	useEffect(() => {
		let isMounted = true
		const controller = new AbortController()

		const loadEvent = async () => {
			setLoading(true)
			setError(null)
			try {
				const { data } = await axios.get(`${apiBase}/api/events/${id}`, { signal: controller.signal })
				if (!isMounted) return
				setEvent(data ?? FALLBACK_EVENT)
			} catch (err) {
				if (!isMounted || axios.isCancel(err)) return
				setError("Unable to load event. Showing sample content.")
				setEvent({ ...FALLBACK_EVENT, id })
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		loadEvent()
		return () => {
			isMounted = false
			controller.abort()
		}
	}, [apiBase, id])

	const countdown = useCountdown(event?.startsAt)

	const seats = useMemo(() => {
		const safeCapacity = Number(event?.capacity) || 0
		const booked = Number(event?.booked) || 0
		const available = Math.max(safeCapacity - booked, 0)
		const percent = safeCapacity > 0 ? Math.min(Math.max((booked / safeCapacity) * 100, 0), 100) : 0
		return { safeCapacity, booked, available, percent }
	}, [event])

	const isSoldOut = seats.available <= 0

	const actionLabel = () => {
		if (status === "registered") return "Already registered"
		if (status === "waitlisted") return "Waitlisted"
		if (isSoldOut) return "Join waitlist"
		return "Register now"
	}

	const actionDisabled = status === "registered"

	const handleAction = () => {
		if (!isAuthenticated) {
			alert("Please log in to continue.")
			return
		}

		if (status === "registered") return

		if (isSoldOut) {
			setStatus("waitlisted")
			alert("You have been added to the waitlist.")
			return
		}

		setStatus("registered")
		alert("You are registered! Your QR code is ready below.")
	}

	const qrUrl = useMemo(() => {
		if (status !== "registered") return null
		const payload = encodeURIComponent(`event:${event?.id};user:me`)
		return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${payload}`
	}, [event?.id, status])

	const formatDateTime = (dateString) => {
		const date = new Date(dateString)
		if (Number.isNaN(date.getTime())) return "TBD"

		return new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			timeZoneName: "short",
		}).format(date)
	}

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />

			<div className="w-full overflow-hidden border-b border-white/10 bg-gradient-to-br from-purple-900 via-slate-950 to-indigo-900">
				<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_30%)]" aria-hidden />
					<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl">
						<div className="relative h-64 w-full overflow-hidden sm:h-80">
							<img
								src={event?.bannerUrl}
								alt={event?.title || "Event banner"}
								className="h-full w-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
							<div className="absolute bottom-0 left-0 right-0 p-6">
								<div className="flex flex-wrap items-center justify-between gap-4">
									<div>
										<p className="text-xs uppercase tracking-[0.22em] text-purple-200">Featured event</p>
										<h1 className="text-3xl font-bold sm:text-4xl">{event?.title}</h1>
									</div>
									<div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100">
										ID: {id}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="relative grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
						<div className="space-y-4">
							<p className="text-slate-200">{event?.description}</p>

							<div className="flex flex-wrap gap-2 text-xs font-semibold text-purple-50">
								{(event?.tags || []).map((tag) => (
									<span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
										{tag}
									</span>
								))}
							</div>

							<div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur">
								<div className="flex items-center justify-between text-slate-200">
									<span>Date & time</span>
									<span className="font-semibold text-white">{formatDateTime(event?.startsAt)}</span>
								</div>
								<div className="flex items-center justify-between text-slate-200">
									<span>Location</span>
									<span className="font-semibold text-white">{event?.location || "TBD"}</span>
								</div>
								<div className="flex items-center justify-between text-slate-200">
									<span>Organizer</span>
									<span className="font-semibold text-white">{event?.organizer || "TBD"}</span>
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur">
									<div className="flex items-center justify-between text-xs uppercase tracking-wide text-purple-200">
										<span>Countdown</span>
										<span className="rounded-full bg-white/10 px-2 py-1 font-semibold">Live</span>
									</div>
									<div className="mt-2 text-2xl font-semibold" aria-live="polite">
										{countdown.formatted}
									</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner backdrop-blur">
									<div className="flex items-center justify-between text-sm font-semibold text-slate-200">
										<span>Seats</span>
										<span>
											{seats.booked}/{seats.safeCapacity || "∞"}
										</span>
									</div>
									<div className="mt-2 h-2 rounded-full bg-slate-800">
										<div
											className="h-2 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500"
											style={{ width: `${seats.percent}%` }}
										/>
									</div>
									<p className="mt-2 text-xs text-slate-300">{seats.available} seats left</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
								<p className="text-sm text-slate-200">Secure your spot or join the waitlist.</p>
								<button
									type="button"
									onClick={handleAction}
									disabled={actionDisabled}
									className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 ${
										status === "registered"
											? "bg-slate-700 text-white shadow-purple-500/10"
											: "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white shadow-purple-500/30 hover:brightness-110"
									} disabled:cursor-not-allowed`}
								>
									<span>{actionLabel()}</span>
									<span aria-hidden>→</span>
								</button>
								{status === "waitlisted" && (
									<p className="mt-3 text-xs text-purple-100">We will notify you if a seat opens up.</p>
								)}
								{status === "registered" && (
									<p className="mt-3 text-xs text-purple-100">You are in! Save the QR for check-in.</p>
								)}
							</div>

							{status === "registered" && qrUrl && (
								<div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-xl backdrop-blur">
									<p className="text-sm font-semibold text-white">Your check-in QR</p>
									<p className="text-xs text-slate-300">Show this at the entrance.</p>
									<div className="mt-4 flex justify-center">
										<img src={qrUrl} alt="QR code for event check-in" className="h-40 w-40 rounded-lg border border-white/10 bg-white" />
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 sm:px-6 lg:px-8">
				{loading && <span>Loading event…</span>}
				{!loading && error && <span>{error}</span>}
				{!loading && !error && <span>Loaded event.</span>}
			</div>
		</div>
	)
}
