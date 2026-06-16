import { getTheSportsDBCrest } from '../services/theSportsDB'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

test('returns null for falsy teamName', async () => {
  expect(await getTheSportsDBCrest('')).toBeNull()
  expect(await getTheSportsDBCrest(null)).toBeNull()
})

test('returns cached value from localStorage without fetching', async () => {
  const cached = { time: Date.now(), url: 'https://example.com/badge.png' }
  localStorage.setItem('tsdb_crest_France', JSON.stringify(cached))
  const fetchSpy = vi.spyOn(globalThis, 'fetch')

  const result = await getTheSportsDBCrest('France')

  expect(result).toBe('https://example.com/badge.png')
  expect(fetchSpy).not.toHaveBeenCalled()
})

test('fetches and caches when cache is stale', async () => {
  const stale = { time: Date.now() - 8 * 24 * 60 * 60 * 1000, url: 'old.png' }
  localStorage.setItem('tsdb_crest_France', JSON.stringify(stale))

  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ teams: [{ strTeamBadge: 'https://fresh.png' }] }),
  })

  const result = await getTheSportsDBCrest('France')

  expect(result).toBe('https://fresh.png')
  const stored = JSON.parse(localStorage.getItem('tsdb_crest_France'))
  expect(stored.url).toBe('https://fresh.png')
})

test('returns null when API returns no teams', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ teams: null }),
  })
  expect(await getTheSportsDBCrest('UnknownTeam')).toBeNull()
})

test('returns null when fetch fails', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false })
  expect(await getTheSportsDBCrest('France')).toBeNull()
})
