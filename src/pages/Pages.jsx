import { Navbar } from "../components/Navbar"

export const Pages = ({ isAuthenticated = false }) => {
	const pages = [
		{
			title: "Events",
			description: "Browse all upcoming events and register for ones that interest you.",
			link: "/events",
			icon: "📅",
		},
		{
			title: "Calendar",
			description: "View events on an interactive calendar organized by date.",
			link: "/calendar",
			icon: "📆",
		},
		{
			title: "About",
			description: "Learn more about our platform and mission.",
			link: "/about",
			icon: "ℹ️",
		},
		{
			title: "Contact",
			description: "Get in touch with us for support or inquiries.",
			link: "/contact",
			icon: "✉️",
		},
		...(isAuthenticated ? [
			{
				title: "My Dashboard",
				description: "Access your personal dashboard with registered events.",
				link: "/dashboard",
				icon: "🏠",
			},
			{
				title: "Profile",
				description: "Manage your account settings and personal information.",
				link: "/dashboard/user/profile",
				icon: "👤",
			},
		] : []),
	]

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
			<Navbar isAuthenticated={isAuthenticated} />

			<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-12">
					<h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Site Pages</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400">
						Explore all sections of EventFlow
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					{pages.map((page) => (
						<a
							key={page.title}
							href={page.link}
							className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg transition hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500"
						>
							<div className="mb-3 text-3xl">{page.icon}</div>
							<h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
								{page.title}
							</h2>
							<p className="text-slate-600 dark:text-slate-400 mb-4">
								{page.description}
							</p>
							<span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition">
								Go to {page.title}
								<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</span>
						</a>
					))}
				</div>

				{!isAuthenticated && (
					<div className="mt-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/20 p-8 text-center">
						<h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
							Get Started
						</h3>
						<p className="text-slate-600 dark:text-slate-400 mb-6">
							Create an account to access more features and register for events.
						</p>
						<div className="flex gap-4 justify-center">
							<a
								href="/login"
								className="rounded-lg bg-blue-600 dark:bg-blue-600 text-white px-6 py-2 font-semibold transition hover:bg-blue-700 dark:hover:bg-blue-700"
							>
								Sign In
							</a>
							<a
								href="/register"
								className="rounded-lg border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 px-6 py-2 font-semibold transition hover:bg-blue-50 dark:hover:bg-blue-900/20"
							>
								Create Account
							</a>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
