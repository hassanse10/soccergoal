import { lookupVenue } from '../utils/venueCoords'

test('returns coords for exact match', () => {
  const result = lookupVenue('MetLife Stadium')
  expect(result).toEqual({ lat: 40.8135, lon: -74.0745, city: 'East Rutherford, NJ' })
})

test('matches case-insensitively', () => {
  const result = lookupVenue('metlife stadium')
  expect(result).not.toBeNull()
  expect(result.city).toBe('East Rutherford, NJ')
})

test('matches on partial venue name', () => {
  const result = lookupVenue('Estadio Azteca, Mexico City')
  expect(result).not.toBeNull()
  expect(result.city).toBe('Mexico City')
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
