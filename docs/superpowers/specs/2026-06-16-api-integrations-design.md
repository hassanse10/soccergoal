# API Integrations Design — TheSportsDB, NewsAPI, Open-Meteo

**Date:** 2026-06-16  
**Status:** Approved  

---

## Goal

Enrich the FIFA World Cup 2026 live dashboard with three complementary public APIs:

1. **TheSportsDB** — fallback team crest images when football-data.org crests fail
2. **NewsAPI** — live WC 2026 news headlines in a strip above the match ticker
3. **Open-Meteo** — current venue weather badge on each match card

---

## Architecture

### Approach: Selective proxy (Option C)

Only NewsAPI is proxied through the server — it requires a secret key and its free tier blocks direct browser calls from non-localhost origins. TheSportsDB and Open-Meteo are called directly from the browser (both are CORS-open and require no key).

The proxy pattern follows the existing `football-data.org` pattern already in `vite.config.js` and `server.js`.

---

## New Files

### `src/services/theSportsDB.js`
- Searches TheSportsDB v1 free API (`/api/v1/json/3/searchteams.php?t=<name>`) by team name
- Returns `strTeamBadge` URL from the first result
- Caches result in `localStorage` with 7-day TTL (same pattern as `getTeamDetails`)
- Called only on `onError` in `TeamCrest` — never on initial render

### `src/services/weather.js`
- Calls `https://api.open-meteo.com/v1/forecast` directly (no key, CORS-open)
- Requests `current=temperature_2m,weathercode` and `timezone=auto`
- Maps WMO weather codes to emoji: `0`=☀️, `1-3`=🌤️, `45/48`=🌫️, `51-67`=🌧️, `71-77`=❄️, `80-82`=🌦️, `95-99`=⛈️
- Caches responses in a module-level `Map` keyed by `"lat,lon"` with 10-minute TTL

### `src/services/news.js`
- Calls `/api/news/everything?q=FIFA+World+Cup+2026&language=en&pageSize=15&sortBy=publishedAt`
- Route is proxied server-side to `newsapi.org` with `Authorization: Bearer <NEWS_API_KEY>` injected

### `src/utils/venueCoords.js`
- Static lookup object: venue name → `{ lat, lon, city }` for all 16 WC 2026 stadiums
- Lookup uses case-insensitive partial string matching against the match's `venue` field
- Stadiums covered: MetLife, AT&T Stadium, Levi's, Rose Bowl, Lincoln Financial Field, Arrowhead, Lumen Field, Hard Rock Stadium, Allegiant, SoFi, Gillette, BC Place, BMO Field, Estadio Azteca, Estadio Akron, Estadio BBVA

### `src/hooks/useNews.js`
- Fetches on mount; holds results in component state
- 15-minute in-memory cache (module-level, survives re-renders but resets on page reload)
- Returns `{ headlines, loading }` — no error state exposed; failure = empty array

### `src/hooks/useVenueWeather.js`
- Accepts a `venueName` string, looks up coords via `venueCoords.js`, calls `weather.js`
- Returns `{ temp, icon }` — both `null` until resolved, and `null` if venue unknown
- Uses `useState`/`useEffect` internally; called by `MatchCard` as a standard React hook

### `src/components/NewsStrip.jsx`
- Renders only when `headlines.length > 0` — invisible during load or on failure
- Fixed "NEWS" label on the left (non-scrolling)
- Scrolling content: source name (muted) + headline text, clickable → opens URL in new tab
- Same `overflow-hidden` + CSS scroll animation pattern as the existing `Ticker`
- Styled with `font-cond text-xs` to stay visually secondary to the match ticker below it

---

## Modified Files

### `src/components/TeamCrest.jsx`
- Adds a second `src` state slot initialized to `null`
- `onError` on the `<img>`: if `fallbackSrc` is null, calls `getTheSportsDBCrest(team.name)` and sets fallbackSrc; if fallbackSrc already tried, hides image (existing behavior)
- No change to the external API of the component

### `src/components/MatchCard.jsx`
- Calls `useVenueWeather(match.venue)` to get `{ temp, icon }`
- Renders `23° ☀️` in `font-cond text-xs text-text-faint` to the left of the existing `›` chevron
- If venue unknown or weather not yet loaded: slot is empty, no layout shift (chevron column is fixed width)

### `src/pages/Matches.jsx`
- Imports `NewsStrip` and renders `<NewsStrip />` immediately above `<Ticker matches={matches} ... />`
- Two lines of change

### `vite.config.js`
- Adds `/api/news` proxy entry targeting `https://newsapi.org/v2`
- Injects `Authorization: Bearer ${env.NEWS_API_KEY}` on each proxied request
- Target `https://newsapi.org/v2`; rewrites `/api/news` → `` so `/api/news/everything` hits `https://newsapi.org/v2/everything` — identical pattern to the existing `/api/fd` proxy

### `server.js`
- Adds `createProxyMiddleware` route for `/api/news` → `https://newsapi.org/v2`
- Injects `Authorization: Bearer ${process.env.NEWS_API_KEY}` header
- Follows identical structure to the existing `/api/fd` route

---

## Environment Variables

Add to `.env`:
```
NEWS_API_KEY=your_newsapi_key_here
```

No new env vars for TheSportsDB (free public key `3` is hardcoded) or Open-Meteo (no key needed).

---

## Error Handling & Degradation

| Integration | Failure behavior |
|-------------|-----------------|
| TheSportsDB crest | Falls back to existing "?" placeholder — no visible error |
| Open-Meteo weather | Weather badge simply absent — no layout shift |
| NewsAPI headlines | `NewsStrip` renders nothing — match ticker still visible |

No new error UI is introduced. All three integrations are purely additive enhancements.

---

## Rate Limits & Caching

| API | Free limit | Cache strategy |
|-----|-----------|----------------|
| TheSportsDB | None stated | `localStorage`, 7-day TTL per team |
| Open-Meteo | Generous / unlimited | Module `Map`, 10-min TTL per venue |
| NewsAPI | 100 req/day (dev tier) | Module cache, 15-min TTL per session |

---

## No New Dependencies

All network calls use `axios` (already installed) or the native `fetch`. No new packages required.
