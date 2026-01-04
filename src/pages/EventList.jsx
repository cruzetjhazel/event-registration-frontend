import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { EventCard } from "../components/EventCard"
import { Navbar } from "../components/Navbar"

const SAMPLE_EVENTS = [
  {
    id: "evt-001",
    title: "Future of JavaScript Summit",
    category: "Conference",
    startsAt: "2026-02-10T15:00:00Z",
    capacity: 320,
    booked: 180,
    tags: ["JavaScript", "Frontend", "Architecture"],
    summary: "Deep dives into the next generation of JS tooling, patterns, and performance.",
  },
  {
    id: "evt-002",
    title: "Design Systems for Scale",
    category: "Workshop",
    startsAt: "2026-01-18T17:30:00Z",
    capacity: 120,
    booked: 95,
    tags: ["Design Systems", "React", "Accessibility"],
    summary: "Hands-on workshop to craft resilient UI kits with accessibility first.",
  },
  {
    id: "evt-003",
    title: "Serverless on Laravel",
    category: "Meetup",
    startsAt: "2026-01-12T18:00:00Z",
    capacity: 80,
    booked: 62,
    tags: ["Laravel", "API", "Serverless"],
    summary: "Practical guide to deploying Laravel APIs to serverless platforms with ease.",
  },
]

const normalizeEvents = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const EventList = ({ isAuthenticated = false }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("All")
  const [sortBy, setSortBy] = useState("soonest")
  const [viewMode, setViewMode] = useState("grid")

  const apiBase = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL ?? ""
    return base.endsWith("/") ? base.slice(0, -1) : base
  }, [])

  const allTags = useMemo(() => {
    const set = new Set()
    events.forEach((evt) => (evt.tags || []).forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [events])

  const filteredEvents = useMemo(() => {
    const queryLower = query.toLowerCase()

    const matchesQuery = (event) =>
      [event.title, event.summary, ...(event.tags || [])]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(queryLower))

    const matchesTag = (event) => tagFilter === "All" || (event.tags || []).includes(tagFilter)

    const sorted = [...events]

    sorted.sort((a, b) => {
      const dateA = new Date(a.startsAt).getTime()
      const dateB = new Date(b.startsAt).getTime()
      const popularityA = Number(a.booked || 0) / Math.max(Number(a.capacity || 1), 1)
      const popularityB = Number(b.booked || 0) / Math.max(Number(b.capacity || 1), 1)

      if (sortBy === "soonest") return dateA - dateB
      if (sortBy === "latest") return dateB - dateA
      if (sortBy === "popular") return popularityB - popularityA
      return 0
    })

    return sorted.filter((event) => matchesQuery(event) && matchesTag(event))
  }, [events, query, sortBy, tagFilter])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadEvents = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.get(`${apiBase}/api/events`, { signal: controller.signal })
        if (!isMounted) return
        const normalized = normalizeEvents(data)
        setEvents(normalized)
        if (normalized.length === 0) {
          setError("No events returned by the API.")
        }
      } catch (err) {
        if (!isMounted || axios.isCancel(err)) return
        setError("Unable to load events from the API. Showing sample data instead.")
        setEvents(SAMPLE_EVENTS)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [apiBase])

  return (
    <div className="app-shell bg-slate-950 text-white">
      <Navbar isAuthenticated={isAuthenticated} />

      <section className="w-full pb-16 pt-6">
        <div className="w-full overflow-hidden border-y border-white/10 bg-gradient-to-br from-purple-900 via-slate-950 to-indigo-900 shadow-2xl">
          <div className="relative isolate mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:px-10 lg:py-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Fresh events weekly
              </span>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Your next great event, front row ready.
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                Explore a curated lineup of conferences, workshops, and meetups built for builders, creators, and operators.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-purple-50">
                {["AI", "Frontend", "Product", "DevOps", "Design", "Data"].map((chip) => (
                  <span key={chip} className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href="#events"
                  className="inline-flex items-center justify-center rounded-full bg-purple-400 px-5 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-purple-400/30 transition hover:translate-y-0.5 hover:bg-purple-300"
                >
                  View Events
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-base font-semibold text-white transition hover:border-purple-300 hover:text-purple-100"
                >
                  Register Now
                </a>
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10" />
              <div className="flex items-center justify-between text-sm text-slate-200">
                <span>Live listings</span>
                <span className="font-semibold text-purple-200">{loading ? "…" : events.length}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                  style={{ width: `${Math.min((events.length || 1) * 15, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">Secure your seat in seconds. Sign in for instant checkout.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="rounded-xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-purple-200">Trending</p>
                  <p className="mt-1 text-lg font-semibold">Workshops</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-purple-200">Most seats</p>
                  <p className="mt-1 text-lg font-semibold">Conferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
              <span className="text-slate-400" aria-hidden>
                🔍
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, speakers, tags…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-100">
              <button
                type="button"
                onClick={() => setTagFilter("All")}
                className={`rounded-full border px-3 py-1 transition ${
                  tagFilter === "All"
                    ? "border-purple-400 bg-purple-400/20 text-purple-100"
                    : "border-white/10 bg-white/5 hover:border-purple-400 hover:text-purple-200"
                }`}
              >
                All tags
              </button>
              {allTags.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setTagFilter(filter)}
                  className={`rounded-full border px-3 py-1 transition ${
                    tagFilter === filter
                      ? "border-purple-400 bg-purple-400/20 text-purple-100"
                      : "border-white/10 bg-white/5 hover:border-purple-400 hover:text-purple-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <label htmlFor="sort" className="text-slate-400">
                Sort
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              >
                <option value="soonest">Soonest</option>
                <option value="latest">Latest</option>
                <option value="popular">Most popular</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-200">
              <span className="text-slate-400">View</span>
              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-xs font-semibold ${
                    viewMode === "grid" ? "bg-purple-400 text-slate-950" : "text-white hover:bg-white/5"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-xs font-semibold ${
                    viewMode === "list" ? "bg-purple-400 text-slate-950" : "text-white hover:bg-white/5"
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            <a
              href={isAuthenticated ? "#events" : "/login"}
              className="inline-flex items-center justify-center rounded-full border border-purple-400 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-400/20"
            >
              {isAuthenticated ? "Register now" : "Login to register"}
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-amber-100 backdrop-blur">
          {loading && <span>Loading events from the API…</span>}
          {!loading && error && <span>{error}</span>}
          {!loading && !error && <span>Loaded events from the API.</span>}
        </div>

        <div
          id="events"
          className={`mt-8 ${
            viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"
          }`}
        >
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.startsAt}
              tags={event.tags}
              capacity={event.capacity}
              registeredCount={event.booked}
              isAuthenticated={isAuthenticated}
              onRegister={() => {
                if (!isAuthenticated) {
                  alert("Please log in to register.")
                  return
                }
                alert(`Registering for ${event.title}`)
              }}
            />
          ))}
          {!loading && filteredEvents.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-white/30 bg-white/5 p-8 text-center text-white">
              No events available right now.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
