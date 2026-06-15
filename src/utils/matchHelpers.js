// Determines which side is leading (for highlighting), null = level/no score yet
export const getLead = (match) => {
  const { status } = match
  const home = match.score?.fullTime?.home
  const away = match.score?.fullTime?.away
  if (status === 'SCHEDULED' || status === 'TIMED' || home == null || away == null) {
    return { h: null, a: null }
  }
  if (home > away) return { h: true, a: false }
  if (away > home) return { h: false, a: true }
  return { h: null, a: null }
}

export const scoreColor = (status, lead) => {
  if (status === 'SCHEDULED' || status === 'TIMED') return 'text-text-faint'
  if (lead === true) return 'text-gold'
  if (lead === false) return 'text-text-muted'
  return 'text-text'
}

export const scoreValue = (match, side) => {
  const v = match.score?.fullTime?.[side]
  return v == null ? '–' : v
}

export const teamDim = (status, lead) =>
  status !== 'SCHEDULED' && status !== 'TIMED' && lead === false ? 'opacity-50' : ''
