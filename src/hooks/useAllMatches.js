import { useCallback, useEffect, useState } from 'react'
import { getAllMatches } from '../services/api'

export const useAllMatches = (params = {}) => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramsKey = JSON.stringify(params)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllMatches(JSON.parse(paramsKey))
      setMatches(res.data.matches ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [paramsKey])

  useEffect(() => {
    load()
  }, [load])

  return { matches, loading, error, retry: load }
}
