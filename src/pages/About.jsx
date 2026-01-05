import { useMemo } from "react"
import { Navbar } from "../components/Navbar"

const highlights = [
	{
		title: "Built for teams",
		body: "Organizers, speakers, and volunteers collaborate in one place with clear roles and permissions.",
	},
	{
		title: "Frictionless check-in",
		body: "QR-based entry, live capacity, and instant badge lookups keep lines moving.",
	},
	{
		title: "Insights that matter",
		body: "Track registrations, attendance, and feedback to iterate on every event you run.",
	},
]

export const About = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />

			<main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10">
				<section className="space-y-3">
					<p className="text-xs uppercase tracking-[0.18em] text-purple-200">About</p>
					<h1 className="text-3xl font-bold sm:text-4xl">EventFlow</h1>
					<p className="max-w-3xl text-lg text-slate-200">
						EventFlow helps organizers and attendees connect through seamless discovery, registration, and on-site check-in.
						We focus on clarity, speed, and great attendee experiences.
					</p>
				</section>

				<section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
					<div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
						<h2 className="text-xl font-semibold text-white">Why teams choose us</h2>
						<div className="space-y-4 text-slate-200">
							{highlights.map((item) => (
								<div key={item.title} className="rounded-2xl border border-white/5 bg-white/5 p-4">
									<h3 className="text-lg font-semibold text-white">{item.title}</h3>
									<p className="mt-1 text-sm text-slate-200">{item.body}</p>
								</div>
							))}
						</div>
					</div>

					<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
						<img
							src="https://images.unsplash.com/photo-1522199584561-5f2d8a7324c0?auto=format&fit=crop&w=1400&q=80"
							alt="People collaborating at an event"
							className="h-full w-full object-cover"
						/>
					</div>
				</section>

				<section className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-indigo-900/40 p-6 shadow-2xl backdrop-blur">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-xl font-semibold text-white">Ready to host?</h2>
							<p className="text-sm text-slate-200">Create your first event and invite your community.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<a
								href="/events"
								className="inline-flex items-center justify-center rounded-full bg-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110"
							>
								View events
							</a>
							<a
								href="/events/new"
								className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
							>
								Create event
							</a>
						</div>
					</div>
				</section>
			</main>
		</div>
	)
}
