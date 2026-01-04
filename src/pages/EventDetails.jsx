import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { Navbar } from "../components/Navbar"

export const EventDetails = () => {
	const { id } = useParams()
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />
			<div className="mx-auto max-w-4xl px-4 py-16">
				<h1 className="text-3xl font-bold">Event details</h1>
				<p className="mt-3 text-slate-200">Details for event ID: {id}</p>
			</div>
		</div>
	)
}
