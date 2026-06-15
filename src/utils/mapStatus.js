import { formatTime } from './formatDate'

// Maps a football-data.org match status to a UI-friendly descriptor
export const mapStatus = (match) => {
  const { status, minute, utcDate } = match

  switch (status) {
    case 'IN_PLAY':
      return { kind: 'live', label: `${minute ?? "'"}'`, color: 'text-live' }
    case 'PAUSED':
      return { kind: 'live', label: 'HT', color: 'text-live' }
    case 'FINISHED':
      return { kind: 'finished', label: 'FT', color: 'text-text-muted' }
    case 'POSTPONED':
      return { kind: 'postponed', label: 'PP', color: 'text-text-faint' }
    case 'SUSPENDED':
      return { kind: 'postponed', label: 'SUSP', color: 'text-text-faint' }
    case 'CANCELLED':
      return { kind: 'postponed', label: 'CANC', color: 'text-text-faint' }
    case 'TIMED':
    case 'SCHEDULED':
    default:
      return { kind: 'scheduled', label: formatTime(utcDate), color: 'text-gold' }
  }
}

export const STATUS_ORDER = { live: 0, scheduled: 1, finished: 2, postponed: 3 }
