export const formatTime = (utcDate) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(utcDate))

export const formatDateLong = (utcDate) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(utcDate))

export const formatDateFull = (utcDate) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(utcDate))

export const dateKey = (utcDate) => new Date(utcDate).toISOString().split('T')[0]

export const isToday = (utcDate) => dateKey(utcDate) === dateKey(new Date().toISOString())

export const groupLabel = (group) =>
  group ? group.replace('GROUP_', 'Group ') : ''
