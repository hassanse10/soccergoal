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
