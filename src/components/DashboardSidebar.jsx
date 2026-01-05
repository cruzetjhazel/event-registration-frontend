import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

export const DashboardSidebar = ({ role = "user" }) => {
	const location = useLocation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const { theme, toggleTheme } = useTheme()

	const handleLogout = () => {
		localStorage.removeItem("auth_token")
		localStorage.removeItem("user_role")
		window.location.href = "/login"
	}

	const menuItems = {
		admin: [
			{ name: "Dashboard", path: "/dashboard/admin", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
			{ name: "All Events", path: "/events", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
			{ name: "Users", path: "/dashboard/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
			{ name: "Analytics", path: "/dashboard/admin/analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
		],
		organizer: [
			{ name: "Dashboard", path: "/dashboard/organizer", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
			{ name: "My Events", path: "/dashboard/organizer/events", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
			{ name: "Create Event", path: "/create-event", icon: "M12 4v16m8-8H4" },
			{ name: "Registrations", path: "/dashboard/organizer/registrations", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
		],
		user: [
			{ name: "Dashboard", path: "/dashboard/user", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
			{ name: "Browse Events", path: "/events", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
			{ name: "My Registrations", path: "/dashboard/user/registrations", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
			{ name: "Profile", path: "/dashboard/user/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
		],
	}

	const items = menuItems[role] || menuItems.user

	const isActive = (path) => location.pathname === path

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-slate-800 dark:bg-slate-800 p-2 text-white shadow-lg"
				aria-label="Toggle menu"
			>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{isMobileMenuOpen ? (
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					) : (
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					)}
				</svg>
			</button>

			{/* Overlay for mobile */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 shadow-xl transition-transform lg:translate-x-0 ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-full flex-col">
					{/* Logo/Brand */}
					<div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 p-6">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h2 className="text-lg font-bold text-slate-900 dark:text-white">EventHub</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{role}</p>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 overflow-y-auto p-4">
						<ul className="space-y-1">
							{items.map((item) => (
								<li key={item.path}>
									<Link
										to={item.path}
										className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
											isActive(item.path)
												? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-purple-900 dark:text-white shadow-lg shadow-purple-500/10"
												: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
										}`}
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
										</svg>
										{item.name}
									</Link>
								</li>
							))}
						</ul>
					</nav>

					{/* User Section */}
					<div className="border-t border-slate-200 dark:border-slate-700 p-4">
												<button
													onClick={toggleTheme}
													className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white mb-2"
												>
													{theme === "dark" ? (
														<>
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
															</svg>
															Light Mode
														</>
													) : (
														<>
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
															</svg>
															Dark Mode
														</>
													)}
												</button>
						<button
							onClick={handleLogout}
							className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Logout
						</button>
					</div>
				</div>
			</aside>
		</>
	)
}
