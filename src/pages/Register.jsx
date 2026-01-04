import { useMemo } from "react"
import { Navbar } from "../components/Navbar"

export const Register = () => {
	const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

	return (
		<div className="min-h-screen bg-slate-950 text-white">
			<Navbar isAuthenticated={isAuthenticated} />
			<div className="mx-auto max-w-3xl px-4 py-16">
				<h1 className="text-3xl font-bold">Register</h1>
				<p className="mt-3 text-slate-200">Registration flow coming soon.</p>
			</div>
		</div>
	)
}
