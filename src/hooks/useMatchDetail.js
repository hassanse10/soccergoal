import { useCallback, useEffect, useState } from 'react'
import { getMatchDetail } from '../services/api'

export const useMatchDetail = (id) => {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const res = await getMatchDetail(id)
      setMatch(res.data.match ?? res.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { match, loading, error, retry: load }
}
