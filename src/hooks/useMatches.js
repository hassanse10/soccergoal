import { useCallback, useEffect, useRef, useState } from 'react'
import { getTodayMatches, getLiveMatches } from '../services/api'

const POLL_INTERVAL = 30000

// Loads today's matches and polls live matches every 30s, merging by id.
export const useMatches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTodayMatches()
      setMatches(res.data.matches ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const pollLive = useCallback(async () => {
    try {
      const res = await getLiveMatches()
      const live = res.data.matches ?? []
      if (live.length === 0) return
      setMatches((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]))
        live.forEach((m) => byId.set(m.id, { ...byId.get(m.id), ...m }))
        return Array.from(byId.values())
      })
    } catch {
      // silent failure on background poll
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    intervalRef.current = setInterval(pollLive, POLL_INTERVAL)
    return () => clearInterval(intervalRef.current)
  }, [pollLive])

  return { matches, loading, error, retry: load }
}
