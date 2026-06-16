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
