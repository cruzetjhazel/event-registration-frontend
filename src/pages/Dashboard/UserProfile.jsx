import api from "../../api/api"
import { useState, useEffect } from "react"
import { DashboardSidebar } from "../../components/DashboardSidebar"

export const UserProfile = () => {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState("")

	// Form states
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [passwordLoading, setPasswordLoading] = useState(false)
	const [passwordError, setPasswordError] = useState("")

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true)
			setError("")
			try {
				const { data } = await api.get("/profile")
				setUser(data)
			} catch (err) {
				setError("Failed to load profile information.")
				console.error(err)
			} finally {
				setLoading(false)
			}
		}

		loadProfile()
	}, [])

	const handleChangePassword = async (e) => {
		e.preventDefault()
		setPasswordError("")
		setSuccess("")

		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordError("All password fields are required.")
			return
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match.")
			return
		}

		if (newPassword.length < 8) {
			setPasswordError("New password must be at least 8 characters.")
			return
		}

		setPasswordLoading(true)
		try {
			await api.post("/change-password", {
				current_password: currentPassword,
				password: newPassword,
				password_confirmation: confirmPassword,
			})
			setSuccess("Password changed successfully!")
			setCurrentPassword("")
			setNewPassword("")
			setConfirmPassword("")
		} catch (err) {
			const message = err?.response?.data?.message ?? "Failed to change password."
			setPasswordError(message)
		} finally {
			setPasswordLoading(false)
		}
	}

	return (
		<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
			<DashboardSidebar role="user" />

			<div className="flex-1 lg:ml-64">
				<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12 text-slate-900 dark:text-white">
					{/* Header */}
					<div className="mb-8">
						<p className="text-xs uppercase tracking-[0.18em] text-purple-200">Account</p>
						<h1 className="text-3xl font-bold">Your Profile</h1>
					</div>

					{/* User Info Section */}
					{loading ? (
						<div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-200">
							Loading profile…
						</div>
					) : error ? (
						<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
							{error}
						</div>
					) : (
						<>
							{/* User Information Card */}
							<div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
								<h2 className="mb-6 text-xl font-semibold">User Information</h2>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
										<p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white">
											{user?.name || "N/A"}
										</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
										<p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white">
											{user?.email || "N/A"}
										</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-400 mb-2">Account Type</label>
										<p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white capitalize">
											{user?.role === "attendee" ? "Attendee" : user?.role || "N/A"}
										</p>
									</div>
									{user?.created_at && (
										<div>
											<label className="block text-sm font-medium text-slate-400 mb-2">Member Since</label>
											<p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white">
												{new Intl.DateTimeFormat("en-US", {
													year: "numeric",
													month: "long",
													day: "numeric",
												}).format(new Date(user.created_at))}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Change Password Section */}
							<div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
								<h2 className="mb-6 text-xl font-semibold">Security Settings</h2>

								{success && (
									<div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
										{success}
									</div>
								)}

								{passwordError && (
									<div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
										{passwordError}
									</div>
								)}

								<form onSubmit={handleChangePassword} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="current">
											Current Password
										</label>
										<input
											id="current"
											type="password"
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
											placeholder="Enter current password"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="new">
											New Password
										</label>
										<input
											id="new"
											type="password"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
											className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
											placeholder="Enter new password"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="confirm">
											Confirm New Password
										</label>
										<input
											id="confirm"
											type="password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
											placeholder="Confirm new password"
										/>
									</div>

									<button
										type="submit"
										disabled={passwordLoading}
										className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
									>
										{passwordLoading ? "Updating…" : "Update Password"}
									</button>
								</form>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
