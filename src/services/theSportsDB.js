const TTL = 7 * 24 * 60 * 60 * 1000

export async function getTheSportsDBCrest(teamName) {
  if (!teamName) return null
  const cacheKey = `tsdb_crest_${teamName}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const { time, url } = JSON.parse(cached)
      if (Date.now() - time < TTL) return url
    } catch { /* ignore malformed entry */ }
  }

  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`
  )
  if (!res.ok) return null
  const json = await res.json()
  const url = json.teams?.[0]?.strTeamBadge ?? null
  localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), url }))
  return url
}
