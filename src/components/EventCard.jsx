import { useMemo } from "react"
import { useCountdown } from "../hooks/useCountdown"

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "TBD"

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date)
}

const progressTone = (percent) => {
  if (percent >= 90) return "bg-red-500"
  if (percent >= 70) return "bg-amber-400"
  return "bg-emerald-500"
}

export const EventCard = ({
  title,
  date,
  tags = [],
  capacity = 0,
  registeredCount = 0,
  isAuthenticated = false,
  onRegister,
}) => {
  const countdown = useCountdown(date)

  const seats = useMemo(() => {
    const safeCapacity = Number(capacity) || 0
    const booked = Number(registeredCount) || 0
    const available = Math.max(safeCapacity - booked, 0)
    const percent = safeCapacity > 0 ? Math.min(Math.max((booked / safeCapacity) * 100, 0), 100) : 0
    return { safeCapacity, booked, available, percent }
  }, [capacity, registeredCount])

  const isSoldOut = seats.available <= 0
  const isPast = countdown.isExpired
  const buttonLabel = isAuthenticated ? (isSoldOut ? "Sold out" : "Register") : "Login to register"
  const buttonDisabled = isSoldOut || isPast

  return (
    <article className="flex flex-col rounded-2xl border border-slate-800/40 bg-white/95 p-5 shadow-xl shadow-slate-900/10 transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{formatDateTime(date)}</p>
        </div>
        <div className="self-start rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {countdown.isExpired ? "Started" : "Starts in"}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Seats</span>
            <span>{seats.booked}/{seats.safeCapacity || "∞"}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${progressTone(seats.percent)} transition-all`}
              style={{ width: `${seats.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-600">{seats.available} seats left</p>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-slate-900 text-white">
          <div className="flex items-center justify-between px-4 pt-4 text-xs uppercase tracking-wide text-slate-200">
            <span>Countdown</span>
            <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-emerald-200">Live</span>
          </div>
          <div className="px-4 pb-4 text-2xl font-semibold" aria-live="polite">
            {countdown.formatted}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          <span>{isSoldOut ? "Fully booked" : "Spots available"}</span>
        </div>
        <button
          type="button"
          onClick={() => onRegister?.()}
          disabled={buttonDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500"
        >
          <span>{buttonLabel}</span>
          <span aria-hidden>→</span>
        </button>
      </div>
    </article>
  )
}
