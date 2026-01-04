import { useEffect, useMemo, useState } from "react"

const getTimeParts = (targetDate) => {
  const now = new Date()
  const target = new Date(targetDate)

  if (Number.isNaN(target.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const diff = target.getTime() - now.getTime()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const secondsTotal = Math.floor(diff / 1000)
  const days = Math.floor(secondsTotal / 86400)
  const hours = Math.floor((secondsTotal % 86400) / 3600)
  const minutes = Math.floor((secondsTotal % 3600) / 60)
  const seconds = secondsTotal % 60

  return { days, hours, minutes, seconds, isExpired: false }
}

export const useCountdown = (targetDate) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(targetDate))

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeParts(targetDate))
    const id = setInterval(tick, 1000)
    tick()

    return () => clearInterval(id)
  }, [targetDate])

  const formatted = useMemo(() => {
    const { days, hours, minutes, seconds } = timeLeft
    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
  }, [timeLeft])

  return { ...timeLeft, formatted }
}
