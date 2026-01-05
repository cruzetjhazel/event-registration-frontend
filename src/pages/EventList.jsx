import axios from "axios"
import { useEffect, useMemo, useState, useRef } from "react"
import { EventCard } from "../components/EventCard"
import { Navbar } from "../components/Navbar"

// Scroll animation hook
const useScrollAnimation = () => {
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    )

    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [])

  return [elementRef, isVisible]
}

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

const transformEventFromApi = (item = {}) => {
  const startsAt = item.startsAt || item.starts_at || item.starts_at_utc
  const capacity = item.capacity ?? item.total_capacity ?? item.limit
  const booked = item.booked ?? item.registrations_count ?? item.attendees
  const tags = Array.isArray(item.tags) ? item.tags : item.topics || []

  return {
    id: item.id ?? item._id ?? crypto.randomUUID?.() ?? String(Math.random()),
    title: item.title ?? item.name ?? "Untitled event",
    summary: item.summary ?? item.description ?? "",
    startsAt,
    capacity,
    booked,
    tags,
  }
}

const normalizeEvents = (payload) => {
  if (!payload) return []
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []
  return list.map(transformEventFromApi)
}

export const EventList = ({ isAuthenticated = false }) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [tagFilter, setTagFilter] = useState("All")
  const [sortBy, setSortBy] = useState("soonest")
  const [viewMode, setViewMode] = useState("grid")

  // Scroll animation refs
  const [searchRef, searchVisible] = useScrollAnimation()
  const [whyChooseRef, whyChooseVisible] = useScrollAnimation()
  const [statsRef, statsVisible] = useScrollAnimation()
  const [categoriesRef, categoriesVisible] = useScrollAnimation()
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation()
  const [ctaRef, ctaVisible] = useScrollAnimation()
  const [eventsRef, eventsVisible] = useScrollAnimation()

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

  const formatDateShort = (dateString) => {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "TBD"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  const eventStatus = (event) => {
    const date = new Date(event?.startsAt)
    if (Number.isNaN(date.getTime())) return { label: "Awaited", tone: "bg-slate-700 text-slate-100" }
    const now = Date.now()
    const diff = date.getTime() - now
    if (diff <= 0) return { label: "Started", tone: "bg-slate-800 text-white" }
    const days = diff / (1000 * 60 * 60 * 24)
    if (days <= 3) return { label: "Coming Soon", tone: "bg-purple-500/20 text-purple-100 border border-purple-400/40" }
    return { label: "Open", tone: "bg-indigo-500/20 text-indigo-100 border border-indigo-400/40" }
  }

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

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-slideInDown {
          animation: slideInDown 0.7s ease-out forwards;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>

      <section className="w-full pb-16 pt-6">
        <div className="w-full overflow-hidden border-y border-white/10 bg-gradient-to-br from-purple-900 via-slate-950 to-indigo-900 shadow-2xl">
          <div className="relative isolate mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr,0.9fr] lg:items-center lg:px-10 lg:py-16">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Live & Upcoming
              </span>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Discover, Register, and Attend Amazing Events
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                From tech conferences to creative workshops, find the perfect event for you. Join thousands of attendees connecting with their passions.
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

        {/* Search and Filter Section */}
        <div 
          ref={searchRef}
          className={`mx-auto mt-10 flex w-full max-w-7xl flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 ${
            searchVisible ? 'animate-slideInDown' : 'opacity-0'
          }`}
        >
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

        <div className="mx-auto mt-4 w-full max-w-7xl rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-amber-100 backdrop-blur sm:px-6 lg:px-8">
          {loading && <span>Loading events from the API…</span>}
          {!loading && error && <span>{error}</span>}
          {!loading && !error && <span>Loaded {events.length} events successfully.</span>}
        </div>

        {/* Why Choose Us Section */}
        <section 
          ref={whyChooseRef}
          className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className={`text-center mb-12 ${whyChooseVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-200 border border-purple-400/30">
              Why Choose Our Platform
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              The Ultimate Event Discovery Platform
            </h2>
            <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">
              Connecting organizers and attendees worldwide for unforgettable experiences
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className={`rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 p-8 backdrop-blur hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30 ${
              whyChooseVisible ? 'animate-fadeInLeft' : 'opacity-0'
            }`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Diverse Events</h3>
              <p className="mt-3 text-slate-300">
                Access events from hundreds of organizers across all industries, topics, and formats in one place.
              </p>
            </div>

            <div className={`rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-8 backdrop-blur hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/30 ${
              whyChooseVisible ? 'animate-fadeInUp animation-delay-100' : 'opacity-0'
            }`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Trusted Platform</h3>
              <p className="mt-3 text-slate-300">
                Secure registration system trusted by thousands of organizers and attendees worldwide.
              </p>
            </div>

            <div className={`rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-8 backdrop-blur hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 ${
              whyChooseVisible ? 'animate-fadeInRight animation-delay-200' : 'opacity-0'
            }`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">One Account, All Events</h3>
              <p className="mt-3 text-slate-300">
                Single account to discover, register, and manage tickets for events from all organizers.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          ref={statsRef}
          className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className={`rounded-3xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/60 via-slate-900/80 to-indigo-900/60 p-8 backdrop-blur sm:p-12 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 ${
            statsVisible ? 'animate-scaleIn' : 'opacity-0'
          }`}>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  500+
                </div>
                <div className="mt-2 text-sm text-slate-300 uppercase tracking-wider">Active Organizers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  50K+
                </div>
                <div className="mt-2 text-sm text-slate-300 uppercase tracking-wider">Events Listed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  2M+
                </div>
                <div className="mt-2 text-sm text-slate-300 uppercase tracking-wider">Registrations</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                  98%
                </div>
                <div className="mt-2 text-sm text-slate-300 uppercase tracking-wider">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Event Categories Section */}
        <section 
          ref={categoriesRef}
          className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className={`text-center mb-12 ${categoriesVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 border border-indigo-400/30">
              Event Categories
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Find Your Perfect Event
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Conferences", icon: "🎤", count: 45, color: "from-purple-500/20 to-pink-500/20", border: "border-purple-400/30" },
              { name: "Workshops", icon: "🛠️", count: 32, color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-400/30" },
              { name: "Meetups", icon: "☕", count: 28, color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-400/30" },
              { name: "Webinars", icon: "💻", count: 56, color: "from-orange-500/20 to-red-500/20", border: "border-orange-400/30" },
              { name: "Networking", icon: "🤝", count: 24, color: "from-violet-500/20 to-purple-500/20", border: "border-violet-400/30" },
              { name: "Training", icon: "📚", count: 19, color: "from-rose-500/20 to-pink-500/20", border: "border-rose-400/30" },
            ].map((category, idx) => (
              <div
                key={category.name}
                className={`group cursor-pointer rounded-2xl border-2 ${category.border} bg-gradient-to-br ${category.color} p-6 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  categoriesVisible ? `animate-fadeInUp animation-delay-${idx < 3 ? (idx + 1) * 100 : (idx - 2) * 100}` : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">{category.count} upcoming events</p>
                  </div>
                  <svg className="h-6 w-6 text-white/50 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          ref={testimonialsRef}
          className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className={`text-center mb-12 ${testimonialsVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              What Our Attendees Say
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Sarah Johnson",
                role: "Event Organizer",
                company: "Tech Conferences Inc",
                text: "This platform made managing registrations effortless. We reached 3x more attendees than our previous events.",
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Software Engineer",
                company: "StartupXYZ",
                text: "Found amazing workshops and conferences I never knew existed. One account for all my event needs!",
                avatar: "MC"
              },
              {
                name: "Emma Williams",
                role: "Community Manager",
                company: "DevMeetup Network",
                text: "As an organizer, this platform connects us with the right audience. Registration and ticketing is seamless.",
                avatar: "EW"
              }
            ].map((testimonial, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur hover:scale-105 hover:border-purple-400/40 transition-all duration-300 hover:shadow-2xl ${
                  testimonialsVisible ? `animate-fadeInUp animation-delay-${(idx + 1) * 100}` : 'opacity-0'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
                <p className="text-slate-300 italic">"{testimonial.text}"</p>
                <div className="mt-4 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`rounded-3xl border-2 border-white/20 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 p-8 backdrop-blur text-center sm:p-12 hover:border-purple-400/40 hover:shadow-2xl transition-all duration-300 ${
            ctaVisible ? 'animate-scaleIn' : 'opacity-0'
          }`}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Join Our Platform Today
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Whether you're an attendee looking for events or an organizer wanting to reach more people - we've got you covered.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={isAuthenticated ? "#events" : "/register"}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105"
              >
                {isAuthenticated ? "Browse Events" : "Create Account"}
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Events Listing Section */}
        <section ref={eventsRef} className="mx-auto mt-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-8 ${eventsVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-3 text-lg text-slate-300">
              Discover and register for events that match your interests
            </p>
          </div>
        </section>

        <div
          id="events"
          className={`mx-auto mt-8 w-full max-w-7xl px-1 sm:px-4 lg:px-2 ${
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

        {/* Footer Section */}
        <footer className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="border-t border-white/10 pt-12">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold text-white">EventFlow</h3>
                <p className="mt-3 text-sm text-slate-400">
                  The leading event discovery and management platform connecting organizers and attendees worldwide. List your events or find your next experience.
                </p>
                <div className="mt-6 flex gap-4">
                  {["twitter", "linkedin", "facebook", "instagram"].map((social) => (
                    <a
                      key={social}
                      href={`#${social}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                      <span className="sr-only">{social}</span>
                      <span>•</span>
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white">Quick Links</h4>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li><a href="/events" className="hover:text-white transition">Browse Events</a></li>
                  <li><a href="/calendar" className="hover:text-white transition">Event Calendar</a></li>
                  <li><a href="/about" className="hover:text-white transition">About Us</a></li>
                  <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white">Support</h4>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
              <p>&copy; 2026 EventFlow. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </section>
    </div>
  )
}
