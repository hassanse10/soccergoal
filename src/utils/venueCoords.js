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
  'sofi stadium':      { lat: 33.9535,  lon: -118.3392, city: 'Inglewood, CA' },
  'gillette':          { lat: 42.0909,  lon: -71.2643,  city: 'Foxborough, MA' },
  'bc place':          { lat: 49.2769,  lon: -123.1114, city: 'Vancouver, BC' },
  'bmo field':         { lat: 43.6332,  lon: -79.4179,  city: 'Toronto, ON' },
  'azteca':            { lat: 19.3029,  lon: -99.1505,  city: 'Mexico City' },
  'estadio akron':     { lat: 20.6895,  lon: -103.4697, city: 'Guadalajara' },
  'estadio bbva':      { lat: 25.6694,  lon: -100.2437, city: 'Monterrey' },
}

export function lookupVenue(venueName) {
  if (!venueName) return null
  const lower = venueName.toLowerCase()
  for (const [key, coords] of Object.entries(VENUES)) {
    if (lower.includes(key)) return coords
  }
  return null
}
