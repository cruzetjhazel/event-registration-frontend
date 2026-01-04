import { Link, NavLink } from "react-router-dom"

const links = [
	{ name: "Events", to: "/events" },
	{ name: "About", to: "/about" },
	{ name: "Contact", to: "/contact" },
]

export const Navbar = ({ isAuthenticated = false }) => {
	return (
		<header className="sticky top-0 z-30 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
			<div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link to="/events" className="group flex items-center gap-3">
					<span
						className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-indigo-500 shadow-lg shadow-purple-500/30 transition duration-300 group-hover:rotate-3 group-hover:scale-110"
						aria-hidden
					/>
					<div className="leading-tight">
						<div className="text-sm font-semibold text-purple-100">EventFlow</div>
						<div className="text-xs text-slate-200">Curated experiences</div>
					</div>
				</Link>

				<nav className="hidden items-center gap-4 text-sm font-medium text-slate-100 sm:flex">
					{links.map((link) => (
						<NavLink
							key={link.name}
							to={link.to}
							className={({ isActive }) =>
								`group relative px-3 py-1 transition duration-300 ${
									isActive ? "text-purple-200" : "text-slate-200 hover:text-purple-200"
								}`
							}
						>
							<span>{link.name}</span>
							<span className="absolute inset-x-2 -bottom-1 block h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 transition-transform duration-300 group-hover:scale-x-100" />
						</NavLink>
					))}
				</nav>

				<div className="flex items-center gap-3 text-sm font-semibold text-white">
					{!isAuthenticated ? (
						<Link
							to="/login"
							className="rounded-full border border-white/20 px-4 py-2 transition duration-300 hover:border-white hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20"
						>
							Login
						</Link>
					) : (
						<Link
							to="/dashboard"
							className="rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-2 shadow-lg shadow-purple-500/30 transition duration-300 hover:brightness-110"
						>
							Dashboard
						</Link>
					)}
				</div>
			</div>
		</header>
	)
}
