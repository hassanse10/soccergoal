import { useCallback, useEffect, useState } from 'react'
import { getStandings } from '../services/api'

export const useStandings = () => {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getStandings()
      setStandings(res.data.standings ?? [])
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { standings, loading, error, retry: load }
}
