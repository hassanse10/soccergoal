import { useCallback, useEffect, useState } from 'react'
import { getAllMatches } from '../services/api'
import { STAGES } from '../utils/stages'

export const useKnockout = () => {
  const [stages, setStages] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllMatches()
      const matches = res.data.matches ?? []
      const byStage = Object.fromEntries(STAGES.map((s) => [s, []]))
      matches.forEach((m) => {
        if (byStage[m.stage]) byStage[m.stage].push(m)
      })
      setStages(byStage)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { stages, loading, error, retry: load }
}
