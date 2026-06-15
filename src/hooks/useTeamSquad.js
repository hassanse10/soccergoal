import { useCallback, useRef, useState } from 'react'
import { getTeamDetails } from '../services/api'

// On-demand, per-team-id cache for squad/coach details. Only fetches
// when load(id) is called (i.e. when a user expands a team panel).
export const useTeamSquad = () => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState({})
  const [error, setError] = useState({})
  const requested = useRef(new Set())

  const load = useCallback((teamId) => {
    if (!teamId || requested.current.has(teamId)) return
    requested.current.add(teamId)
    setLoading((l) => ({ ...l, [teamId]: true }))
    getTeamDetails(teamId)
      .then((res) => setData((d) => ({ ...d, [teamId]: res.data })))
      .catch((err) => setError((e) => ({ ...e, [teamId]: err })))
      .finally(() => setLoading((l) => ({ ...l, [teamId]: false })))
  }, [])

  return { data, loading, error, load }
}
