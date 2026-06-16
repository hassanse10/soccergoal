# API Integrations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up TheSportsDB (team crest fallback), NewsAPI (news strip above match ticker), and Open-Meteo (venue weather badge on match cards) into the existing World Cup 2026 dashboard.

**Architecture:** NewsAPI is proxied through the Express server (key-gated + free-tier CORS restriction). TheSportsDB and Open-Meteo are called directly from the browser — both are CORS-open and require no key. New service modules feed new hooks which feed updated components. Nothing existing is deleted.

**Tech Stack:** React 19, Vite 8, Axios, Express, TheSportsDB v1, NewsAPI v2, Open-Meteo, Vitest (added here)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/utils/venueCoords.js` | Static WC 2026 venue → lat/lon lookup |
| Create | `src/services/weather.js` | Open-Meteo fetch + WMO icon mapper + 10-min cache |
| Create | `src/services/theSportsDB.js` | TheSportsDB crest fetch + localStorage 7-day cache |
| Create | `src/services/news.js` | NewsAPI fetch via `/api/news` proxy |
| Create | `src/hooks/useVenueWeather.js` | React hook: venue name → `{ temp, icon }` |
| Create | `src/hooks/useNews.js` | React hook: fetch headlines, 15-min in-memory cache |
| Create | `src/components/NewsStrip.jsx` | Scrolling news headline strip |
| Create | `src/test/venueCoords.test.js` | Tests for `lookupVenue()` |
| Create | `src/test/weather.test.js` | Tests for `wmoIcon()` |
| Create | `src/test/theSportsDB.test.js` | Tests for localStorage cache logic |
| Modify | `vite.config.js` | Add `/api/news` proxy |
| Modify | `server.js` | Add `/api/news` proxy middleware |
| Modify | `src/components/TeamCrest.jsx` | TheSportsDB fallback on `onError` |
| Modify | `src/components/MatchCard.jsx` | Weather badge |
| Modify | `src/pages/Matches.jsx` | Render `<NewsStrip>` above `<Ticker>` |

---

## Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest jsdom @vitest/ui
```

- [ ] **Step 2: Add test script to package.json**

Open `package.json`. In `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

So `"scripts"` becomes:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "start": "node server.js",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Add test config to vite.config.js**

Open `vite.config.js`. Replace the existing export with:

```js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
    },
    server: {
      proxy: {
        '/api/fd': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fd/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('X-Auth-Token', env.FD_API_KEY)
            })
          },
        },
      },
    },
  }
})
```

- [ ] **Step 4: Verify Vitest works**

Create `src/test/setup.test.js` with:

```js
test('vitest is working', () => {
  expect(1 + 1).toBe(2)
})
```

Run:
```bash
npm test
```

Expected output includes: `✓ src/test/setup.test.js > vitest is working`

- [ ] **Step 5: Delete the setup test file**

```bash
rm src/test/setup.test.js
```

- [ ] **Step 6: Commit**

```bash
git add package.json vite.config.js package-lock.json
git commit -m "chore: add Vitest with jsdom environment"
```

---

## Task 2: venueCoords.js

**Files:**
- Create: `src/utils/venueCoords.js`
- Create: `src/test/venueCoords.test.js`

- [ ] **Step 1: Write the failing test**

Create `src/test/venueCoords.test.js`:

```js
import { lookupVenue } from '../utils/venueCoords'

test('returns coords for exact match', () => {
  const result = lookupVenue('MetLife Stadium')
  expect(result).toEqual({ lat: 40.8135, lon: -74.0745, city: 'East Rutherford, NJ' })
})

test('matches case-insensitively', () => {
  expect(lookupVenue('metlife stadium')).not.toBeNull()
})

test('matches on partial venue name', () => {
  expect(lookupVenue('Estadio Azteca, Mexico City')).not.toBeNull()
})

test('returns null for unknown venue', () => {
  expect(lookupVenue('Unknown Arena XYZ')).toBeNull()
})

test('returns null for empty string', () => {
  expect(lookupVenue('')).toBeNull()
})

test('returns null for null', () => {
  expect(lookupVenue(null)).toBeNull()
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../utils/venueCoords'`

- [ ] **Step 3: Create venueCoords.js**

Create `src/utils/venueCoords.js`:

```js
const VENUES = {
  'metlife':           { lat: 40.8135,  lon: -74.0745,  city: 'East Rutherford, NJ' },
  'at&t stadium':      { lat: 32.7480,  lon: -97.0931,  city: 'Arlington, TX' },
  "levi's":            { lat: 37.4032,  lon: -121.9697, city: 'Santa Clara, CA' },
  'rose bowl':         { lat: 34.1614,  lon: -118.1678, city: 'Pasadena, CA' },
  'lincoln financial': { lat: 39.9008,  lon: -75.1675,  city: 'Philadelphia, PA' },
  'arrowhead':         { lat: 39.0489,  lon: -94.4839,  city: 'Kansas City, MO' },
  'lumen field':       { lat: 47.5952,  lon: -122.3316, city: 'Seattle, WA' },
  'hard rock':         { lat: 25.9580,  lon: -80.2388,  city: 'Miami Gardens, FL' },
  'allegiant':         { lat: 36.0909,  lon: -115.1833, city: 'Las Vegas, NV' },
  'sofi':              { lat: 33.9535,  lon: -118.3392, city: 'Inglewood, CA' },
  'gillette':          { lat: 42.0909,  lon: -71.2643,  city: 'Foxborough, MA' },
  'bc place':          { lat: 49.2769,  lon: -123.1114, city: 'Vancouver, BC' },
  'bmo field':         { lat: 43.6332,  lon: -79.4179,  city: 'Toronto, ON' },
  'azteca':            { lat: 19.3029,  lon: -99.1505,  city: 'Mexico City' },
  'akron':             { lat: 20.6895,  lon: -103.4697, city: 'Guadalajara' },
  'bbva':              { lat: 25.6694,  lon: -100.2437, city: 'Monterrey' },
}

export function lookupVenue(venueName) {
  if (!venueName) return null
  const lower = venueName.toLowerCase()
  for (const [key, coords] of Object.entries(VENUES)) {
    if (lower.includes(key)) return coords
  }
  return null
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: all 6 tests in `venueCoords.test.js` pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/venueCoords.js src/test/venueCoords.test.js
git commit -m "feat: add WC 2026 venue coordinates lookup"
```

---

## Task 3: weather.js

**Files:**
- Create: `src/services/weather.js`
- Create: `src/test/weather.test.js`

- [ ] **Step 1: Write failing tests for the pure icon mapper**

Create `src/test/weather.test.js`:

```js
import { wmoIcon } from '../services/weather'

test('clear sky returns sun emoji', () => {
  expect(wmoIcon(0)).toBe('☀️')
})

test('partly cloudy codes return cloud-sun emoji', () => {
  expect(wmoIcon(1)).toBe('🌤️')
  expect(wmoIcon(2)).toBe('🌤️')
  expect(wmoIcon(3)).toBe('🌤️')
})

test('fog codes return fog emoji', () => {
  expect(wmoIcon(45)).toBe('🌫️')
  expect(wmoIcon(48)).toBe('🌫️')
})

test('rain codes return rain emoji', () => {
  expect(wmoIcon(61)).toBe('🌧️')
  expect(wmoIcon(65)).toBe('🌧️')
})

test('snow codes return snow emoji', () => {
  expect(wmoIcon(71)).toBe('❄️')
  expect(wmoIcon(77)).toBe('❄️')
})

test('shower codes return cloud-rain emoji', () => {
  expect(wmoIcon(80)).toBe('🌦️')
  expect(wmoIcon(82)).toBe('🌦️')
})

test('thunderstorm codes return lightning emoji', () => {
  expect(wmoIcon(95)).toBe('⛈️')
  expect(wmoIcon(99)).toBe('⛈️')
})

test('unknown code returns thermometer emoji', () => {
  expect(wmoIcon(999)).toBe('🌡️')
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../services/weather'`

- [ ] **Step 3: Create weather.js**

Create `src/services/weather.js`:

```js
const WMO_ICONS = {
  0: '☀️',
  1: '🌤️', 2: '🌤️', 3: '🌤️',
  45: '🌫️', 48: '🌫️',
  51: '🌧️', 53: '🌧️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  66: '🌧️', 67: '🌧️',
  71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
  80: '🌦️', 81: '🌦️', 82: '🌦️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
}

export function wmoIcon(code) {
  return WMO_ICONS[code] ?? '🌡️'
}

const _cache = new Map()
const TTL = 10 * 60 * 1000

export async function getWeather(lat, lon) {
  const key = `${lat},${lon}`
  const cached = _cache.get(key)
  if (cached && Date.now() - cached.time < TTL) return cached.data

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode&timezone=auto`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)
  const json = await res.json()
  const data = {
    temp: Math.round(json.current.temperature_2m),
    icon: wmoIcon(json.current.weathercode),
  }
  _cache.set(key, { time: Date.now(), data })
  return data
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: all 8 tests in `weather.test.js` pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/weather.js src/test/weather.test.js
git commit -m "feat: add Open-Meteo weather service with WMO icon mapper"
```

---

## Task 4: theSportsDB.js

**Files:**
- Create: `src/services/theSportsDB.js`
- Create: `src/test/theSportsDB.test.js`

- [ ] **Step 1: Write failing tests for the cache logic**

Create `src/test/theSportsDB.test.js`:

```js
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
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../services/theSportsDB'`

- [ ] **Step 3: Create theSportsDB.js**

Create `src/services/theSportsDB.js`:

```js
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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test
```

Expected: all 5 tests in `theSportsDB.test.js` pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/theSportsDB.js src/test/theSportsDB.test.js
git commit -m "feat: add TheSportsDB crest service with localStorage cache"
```

---

## Task 5: NewsAPI proxy setup

**Files:**
- Modify: `vite.config.js`
- Modify: `server.js`
- Create/Modify: `.env`

- [ ] **Step 1: Add NEWS_API_KEY to your .env file**

If `.env` doesn't exist, create it. Add this line:
```
NEWS_API_KEY=your_key_from_newsapi_org
```
(Get a free key at https://newsapi.org — click "Get API Key", sign up, copy the key.)

- [ ] **Step 2: Add /api/news proxy to vite.config.js**

Open `vite.config.js`. In the `proxy` object, add a second entry after `/api/fd`:

```js
'/api/news': {
  target: 'https://newsapi.org/v2',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/news/, ''),
  configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('Authorization', `Bearer ${env.NEWS_API_KEY}`)
    })
  },
},
```

The full `proxy` block should now look like:

```js
proxy: {
  '/api/fd': {
    target: 'https://api.football-data.org/v4',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/fd/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('X-Auth-Token', env.FD_API_KEY)
      })
    },
  },
  '/api/news': {
    target: 'https://newsapi.org/v2',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/news/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Authorization', `Bearer ${env.NEWS_API_KEY}`)
      })
    },
  },
},
```

- [ ] **Step 3: Add /api/news proxy to server.js**

Open `server.js`. Add a second `app.use` block for news, immediately after the existing `/api/fd` block:

```js
app.use(
  '/api/news',
  createProxyMiddleware({
    target: 'https://newsapi.org/v2',
    changeOrigin: true,
    pathRewrite: { '^/api/news': '' },
    headers: { Authorization: `Bearer ${process.env.NEWS_API_KEY}` },
  })
)
```

- [ ] **Step 4: Verify the proxy in the browser**

Start the dev server:
```bash
npm run dev
```

Open a new browser tab and navigate to:
```
http://localhost:5173/api/news/everything?q=FIFA+World+Cup+2026&language=en&pageSize=3&sortBy=publishedAt
```

Expected: a JSON response with an `articles` array containing 3 news items. If you see `{"status":"error","code":"apiKeyInvalid"...}`, double-check the key in `.env` and restart the dev server.

- [ ] **Step 5: Commit**

```bash
git add vite.config.js server.js
git commit -m "feat: add /api/news proxy for NewsAPI (dev + prod)"
```

---

## Task 6: news.js service + useNews.js hook

**Files:**
- Create: `src/services/news.js`
- Create: `src/hooks/useNews.js`

- [ ] **Step 1: Create news.js**

Create `src/services/news.js`:

```js
import axios from 'axios'

export async function getWCNews() {
  const res = await axios.get('/api/news/everything', {
    params: {
      q: 'FIFA World Cup 2026',
      language: 'en',
      pageSize: 15,
      sortBy: 'publishedAt',
    },
  })
  return res.data.articles ?? []
}
```

- [ ] **Step 2: Create useNews.js**

Create `src/hooks/useNews.js`:

```js
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
```

- [ ] **Step 3: Commit**

```bash
git add src/services/news.js src/hooks/useNews.js
git commit -m "feat: add NewsAPI service and useNews hook"
```

---

## Task 7: useVenueWeather.js hook

**Files:**
- Create: `src/hooks/useVenueWeather.js`

- [ ] **Step 1: Create useVenueWeather.js**

Create `src/hooks/useVenueWeather.js`:

```js
import { useEffect, useState } from 'react'
import { lookupVenue } from '../utils/venueCoords'
import { getWeather } from '../services/weather'

export function useVenueWeather(venueName) {
  const [weather, setWeather] = useState({ temp: null, icon: null })

  useEffect(() => {
    if (!venueName) return
    const coords = lookupVenue(venueName)
    if (!coords) return
    let cancelled = false
    getWeather(coords.lat, coords.lon)
      .then((data) => { if (!cancelled) setWeather(data) })
      .catch(() => { /* silent — badge stays absent */ })
    return () => { cancelled = true }
  }, [venueName])

  return weather
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useVenueWeather.js
git commit -m "feat: add useVenueWeather hook (Open-Meteo via venueCoords lookup)"
```

---

## Task 8: TeamCrest.jsx — TheSportsDB fallback

**Files:**
- Modify: `src/components/TeamCrest.jsx`

The current component hides the image permanently on `onError`. We replace that with a two-stage fallback: first try TheSportsDB, then fall back to the "?" placeholder.

- [ ] **Step 1: Update TeamCrest.jsx**

Replace the entire content of `src/components/TeamCrest.jsx` with:

```jsx
import { useState, useEffect } from 'react'
import { getTheSportsDBCrest } from '../services/theSportsDB'

export const TeamCrest = ({ team, size = 22 }) => {
  const [fallbackSrc, setFallbackSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  // When there is no primary crest URL at all, try TheSportsDB immediately.
  useEffect(() => {
    if (!team?.crest && team?.name) {
      getTheSportsDBCrest(team.name)
        .then((url) => { if (url) setFallbackSrc(url) })
        .catch(() => {})
    }
  }, [team?.crest, team?.name])

  // When the primary crest URL exists but fails to load, try TheSportsDB.
  const handleError = async () => {
    if (fallbackSrc !== null) {
      setFailed(true)
      return
    }
    try {
      const url = await getTheSportsDBCrest(team?.name)
      if (url) {
        setFallbackSrc(url)
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    }
  }

  const src = fallbackSrc ?? team?.crest

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="flex-none rounded-sm object-contain"
        loading="lazy"
        onError={handleError}
      />
    )
  }

  return (
    <span
      className="flex flex-none items-center justify-center rounded-sm bg-border-2 text-[10px] font-bold text-text-faint"
      style={{ width: size, height: size }}
    >
      ?
    </span>
  )
}
```

- [ ] **Step 2: Verify in the browser**

Run `npm run dev`, open the app, and navigate to a match card or the live hero section. For a team whose crest loads fine — no visible change. To test the fallback manually: open DevTools → Network → right-click a crest image request → Block request URL → reload. The crest should attempt TheSportsDB and either show the badge or fall back to "?".

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all existing tests still pass (no regressions).

- [ ] **Step 4: Commit**

```bash
git add src/components/TeamCrest.jsx
git commit -m "feat: add TheSportsDB crest fallback to TeamCrest"
```

---

## Task 9: NewsStrip.jsx component

**Files:**
- Create: `src/components/NewsStrip.jsx`

- [ ] **Step 1: Create NewsStrip.jsx**

Create `src/components/NewsStrip.jsx`:

```jsx
import { useNews } from '../hooks/useNews'

export function NewsStrip() {
  const { headlines } = useNews()
  if (headlines.length === 0) return null

  return (
    <div className="mb-3 flex overflow-hidden rounded-xl border border-border-2 bg-surface-2">
      <div className="flex flex-none items-center border-r border-border-2 bg-surface px-3 py-2">
        <span className="font-cond text-[11px] font-semibold tracking-widest text-text-faint">
          NEWS
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-scroll flex w-max">
          {[...headlines, ...headlines].map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-none items-center gap-2 border-r border-border-2 px-4 py-2 transition-colors hover:bg-surface"
            >
              <span className="font-cond text-[11px] text-text-faint">
                {article.source?.name}
              </span>
              <span className="max-w-[320px] truncate font-cond text-[12px] text-text">
                {article.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/NewsStrip.jsx
git commit -m "feat: add NewsStrip scrolling headline component"
```

---

## Task 10: MatchCard.jsx — weather badge

**Files:**
- Modify: `src/components/MatchCard.jsx`

- [ ] **Step 1: Update MatchCard.jsx**

Replace the entire content of `src/components/MatchCard.jsx` with:

```jsx
import { TeamCrest } from './TeamCrest'
import { mapStatus } from '../utils/mapStatus'
import { getLead, scoreColor, scoreValue, teamDim } from '../utils/matchHelpers'
import { groupLabel } from '../utils/formatDate'
import { useVenueWeather } from '../hooks/useVenueWeather'

export const MatchCard = ({ match, onClick }) => {
  const status = mapStatus(match)
  const lead = getLead(match)
  const { temp, icon } = useVenueWeather(match.venue)

  return (
    <div
      onClick={() => onClick?.(match)}
      className="flex cursor-pointer items-center gap-2 border-b border-border-2 px-3.5 py-3 transition-colors last:border-b-0 hover:bg-surface"
    >
      <div className="w-[54px] flex-none text-center">
        <div className={`flex items-center justify-center gap-1.5 font-cond text-sm font-semibold tracking-wide ${status.color}`}>
          {status.kind === 'live' && (
            <span className="h-1.5 w-1.5 flex-none animate-pulse-dot rounded-full bg-live" />
          )}
          {status.label}
        </div>
        <div className="mt-0.5 font-cond text-[10px] tracking-wide text-text-faint">
          {groupLabel(match.group)}
        </div>
      </div>
      <div className="h-full w-px flex-none self-stretch bg-border-2" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <TeamRow team={match.homeTeam} score={scoreValue(match, 'home')} dim={teamDim(match.status, lead.h)} scoreColorClass={scoreColor(match.status, lead.h)} />
        <TeamRow team={match.awayTeam} score={scoreValue(match, 'away')} dim={teamDim(match.status, lead.a)} scoreColorClass={scoreColor(match.status, lead.a)} />
      </div>
      {temp !== null && (
        <span className="flex-none font-cond text-xs text-text-faint">
          {temp}° {icon}
        </span>
      )}
      <div className="w-3.5 flex-none text-right text-lg text-text-faint">›</div>
    </div>
  )
}

const TeamRow = ({ team, score, dim, scoreColorClass }) => (
  <div className="flex min-w-0 items-center gap-2.5">
    <TeamCrest team={team} />
    <span className={`min-w-0 flex-1 truncate font-display text-[15.5px] font-semibold ${dim}`}>
      {team?.name ?? team?.shortName ?? 'TBD'}
    </span>
    <span className={`w-[18px] flex-none text-center font-cond text-lg font-bold ${scoreColorClass} ${dim}`}>
      {score}
    </span>
  </div>
)
```

- [ ] **Step 2: Verify in browser**

Navigate to any match in the app. After a brief moment, the right side of each match card should show something like `22° ☀️`. If a match venue isn't in `venueCoords.js`, nothing appears there — that's correct behavior.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/MatchCard.jsx
git commit -m "feat: add Open-Meteo venue weather badge to MatchCard"
```

---

## Task 11: Matches.jsx — wire in NewsStrip

**Files:**
- Modify: `src/pages/Matches.jsx`

- [ ] **Step 1: Add NewsStrip import and render**

Open `src/pages/Matches.jsx`. Add the import at the top:

```js
import { NewsStrip } from '../components/NewsStrip'
```

Then in the JSX return, place `<NewsStrip />` directly above `<Ticker>`:

```jsx
<div className="animate-fade">
  <Hero liveMatches={liveMatches} onSelect={(m) => setSelectedId(m.id)} />
  <NewsStrip />
  <Ticker matches={matches} onSelect={(m) => setSelectedId(m.id)} />

  {sections.map((sec) => (
    ...
```

- [ ] **Step 2: Verify in browser**

With `npm run dev` running, open the Matches tab. Above the match score ticker you should now see a slim "NEWS" strip scrolling WC 2026 headlines. If the strip doesn't appear, check the browser console for network errors on `/api/news/...` — likely the `NEWS_API_KEY` is missing or incorrect in `.env`.

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Matches.jsx
git commit -m "feat: render NewsStrip above match ticker on Matches page"
```

---

## Task 12: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: all tests in `venueCoords.test.js`, `weather.test.js`, `theSportsDB.test.js` pass with no failures.

- [ ] **Step 2: Smoke-test the app**

Run `npm run dev` and verify:

| Feature | Where to check | Expected |
|---------|---------------|----------|
| News strip | Matches tab, above match ticker | Scrolling WC 2026 headlines with source names |
| Team crests | Any match card or hero section | Crests load; intentionally break one URL in DevTools and confirm TheSportsDB badge loads as fallback |
| Weather badge | Right side of each match card | `22° ☀️` or equivalent (may take a second to appear) |
| No layout shift | Match cards without a known venue | Badge slot absent but card layout unchanged |
| Ticker still works | Matches tab | Match score ticker scrolls below the news strip |
| Other tabs | Groups, Schedule, Knockout | No regressions |

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: build completes with no errors.
