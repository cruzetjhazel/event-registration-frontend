import axios from "axios"
import { useMemo, useState } from "react"
import { Navbar } from "../components/Navbar"

export const CreateEvent = () => {
  const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    location: "",
    capacity: "",
    tags: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const apiBase = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? ""
    return base.endsWith("/") ? base.slice(0, -1) : base
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim() || !formData.description.trim() || !formData.startsAt || !formData.location.trim()) {
      setError("Title, description, date, and location are required.")
      return
    }

    const capacity = Number(formData.capacity)
    if (formData.capacity && capacity <= 0) {
      setError("Capacity must be a positive number.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        starts_at: formData.startsAt,
        ends_at: formData.endsAt,
        location: formData.location,
        capacity: capacity || null,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      const { data } = await axios.post(`${apiBase}/api/events`, payload)
      window.location.href = `/events/${data?.id || ""}`
    } catch (err) {
      const message = err?.response?.data?.message ?? "Unable to create event. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar isAuthenticated={isAuthenticated} />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-bold">Create an event</h1>
          <p className="mt-2 text-slate-200">Fill in the details and launch your event.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100" htmlFor="title">
                Event title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. JavaScript Summit 2026"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is your event about? Who should attend?"
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100" htmlFor="startsAt">
                  Start date & time
                </label>
                <input
                  id="startsAt"
                  name="startsAt"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100" htmlFor="endsAt">
                  End date & time (optional)
                </label>
                <input
                  id="endsAt"
                  name="endsAt"
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-100" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Pier 27, San Francisco, CA"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100" htmlFor="capacity">
                  Capacity (optional)
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-100" htmlFor="tags">
                  Tags (comma-separated)
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. JavaScript, Frontend, Web"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white outline-none ring-0 transition focus:border-purple-400"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating..." : "Create event"}
              </button>
              <a
                href="/events"
                className="flex items-center justify-center rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
