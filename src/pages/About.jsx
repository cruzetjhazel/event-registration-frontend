import { useMemo } from "react"
import { Navbar } from "../components/Navbar"

export const About = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />
			<div className="mx-auto max-w-4xl px-4 py-16">
				<h1 className="text-3xl font-bold">About EventFlow</h1>
				<p className="mt-4 text-slate-200">
					EventFlow helps organizers and attendees connect through seamless event discovery and registration.
				</p>
			</div>
		</div>
	)
}
