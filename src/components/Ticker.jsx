import { TeamCrest } from './TeamCrest'
import { mapStatus } from '../utils/mapStatus'
import { scoreValue } from '../utils/matchHelpers'

const TickerItem = ({ m, onSelect }) => {
  const status = mapStatus(m)
  const isLive = status.kind === 'live'
  return (
    <button
      onClick={() => onSelect?.(m)}
      className="flex flex-none items-center gap-2.5 border-r border-border-2 px-4 py-2.5 transition-colors hover:bg-surface"
    >
      <span className={`flex-none font-cond text-xs font-semibold tracking-wide ${status.color}`}>
        {isLive && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-live align-middle" />}
        {status.label}
      </span>
      <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
        <TeamCrest team={m.homeTeam} size={16} />
        <span className="font-medium">{m.homeTeam?.tla ?? m.homeTeam?.shortName ?? '?'}</span>
        <span className="font-cond font-bold text-text-dim">{scoreValue(m, 'home')}–{scoreValue(m, 'away')}</span>
        <span className="font-medium">{m.awayTeam?.tla ?? m.awayTeam?.shortName ?? '?'}</span>
        <TeamCrest team={m.awayTeam} size={16} />
      </span>
    </button>
  )
}

export const Ticker = ({ matches, onSelect }) => {
  if (!matches || matches.length === 0) return null

  return (
    <div className="ticker-track group mb-5 overflow-hidden rounded-xl border border-border-2 bg-surface-2">
      <div className="ticker-scroll flex w-max gap-0">
        {matches.map((m) => (
          <TickerItem key={`a-${m.id}`} m={m} onSelect={onSelect} />
        ))}
        {matches.map((m) => (
          <TickerItem key={`b-${m.id}`} m={m} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}
