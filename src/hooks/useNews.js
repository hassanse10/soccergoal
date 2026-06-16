import { useEffect, useState } from 'react'
import { getWCNews } from '../services/news'

const TTL = 15 * 60 * 1000
let _cache = null

export function useNews() {
  const [headlines, setHeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (_cache && Date.now() - _cache.time < TTL) {
        setHeadlines(_cache.articles)
        setLoading(false)
        return
      }
      try {
        const articles = await getWCNews()
        if (!cancelled) {
          _cache = { time: Date.now(), articles }
          setHeadlines(articles)
        }
      } catch { /* silent failure — strip stays hidden */ }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { headlines, loading }
}
