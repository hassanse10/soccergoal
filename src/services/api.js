import axios from 'axios'

// football-data.org has no CORS headers and requires a secret API key,
// so all requests go through our own server-side proxy: the Vite dev
// proxy in development (see vite.config.js), or server.js in production.
const client = axios.create({
  baseURL: '/api/fd',
})

// Short-lived cache for the full fixture list (free-tier API allows only
// 10 req/min, and both the Schedule and Knockout tabs need this).
const CACHE_TTL = 60000
let allMatchesCache = null

export const getAllMatches = (params = {}) => {
  if (Object.keys(params).length === 0) {
    const now = Date.now()
    if (allMatchesCache && now - allMatchesCache.time < CACHE_TTL) {
      return Promise.resolve(allMatchesCache.response)
    }
    return client.get('/competitions/WC/matches').then((response) => {
      allMatchesCache = { time: Date.now(), response }
      return response
    })
  }
  return client.get('/competitions/WC/matches', { params })
}

export const getLiveMatches = () =>
  client.get('/competitions/WC/matches', { params: { status: 'IN_PLAY' } })

export const getTodayMatches = () => {
  const today = new Date().toISOString().split('T')[0]
  return client.get('/competitions/WC/matches', {
    params: { dateFrom: today, dateTo: today },
  })
}

export const getStandings = () => client.get('/competitions/WC/standings')

export const getMatchDetail = (id) => client.get(`/matches/${id}`)

export const getTeams = () => client.get('/competitions/WC/teams')

// Team profile (squad, coach, etc.) is essentially static during the
// tournament, so cache it in localStorage for a full day to avoid
// spending the 10 req/min budget on repeat lookups.
const TEAM_CACHE_TTL = 24 * 60 * 60 * 1000

export const getTeamDetails = (id) => {
  const cacheKey = `team_${id}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      const { time, data } = JSON.parse(cached)
      if (Date.now() - time < TEAM_CACHE_TTL) {
        return Promise.resolve({ data })
      }
    } catch {
      // ignore malformed cache entry
    }
  }
  return client.get(`/teams/${id}`).then((response) => {
    localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: response.data }))
    return response
  })
}

export default client
