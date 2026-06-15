import { useEffect } from 'react'
import { TeamCrest } from './TeamCrest'
import { mapStatus } from '../utils/mapStatus'
import { scoreValue } from '../utils/matchHelpers'
import { formatDateFull, formatTime, groupLabel } from '../utils/formatDate'
import { SkeletonCard } from './Skeleton'
import { ErrorCard } from './ErrorCard'

const statusFullLabel = (match) => {
  const status = mapStatus(match)
  if (status.kind === 'live') return match.status === 'PAUSED' ? 'HALF TIME' : `${match.minute ?? ''}' · LIVE`
  if (status.kind === 'finished') return 'FULL TIME'
  if (status.kind === 'postponed') return status.label
  return `${formatDateFull(match.utcDate)} · ${formatTime(match.utcDate)}`
}

const statusPillClasses = (match) => {
  const status = mapStatus(match)
  if (status.kind === 'live') return 'bg-live-bg text-live'
  if (status.kind === 'finished') return 'bg-[rgba(139,148,158,.14)] text-text-dim'
  return 'bg-[rgba(0,200,83,.14)] text-live'
}

export const MatchModal = ({ match, loading, error, onClose, onRetry }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const summary = match
  const goals = (summary?.goals ?? []).map((g) => ({
    minute: g.minute,
    player: g.scorer?.name ?? 'Unknown',
    isHome: g.team?.id === summary.homeTeam?.id,
  }))

  return (
    <div
      onClick={onClose}
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-rise my-auto w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl"
      >
        <div className="relative border-b border-border bg-[radial-gradient(120%_130%_at_50%_0%,#15242F,#0C131A)] p-4 pb-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-cond text-xs tracking-wide text-text-faint">
              {groupLabel(summary?.group)}{summary?.venue ? ` · ${summary.venue}` : ''}
            </span>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-sm text-text-muted hover:text-text"
            >
              ✕
            </button>
          </div>

          {summary && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
                <TeamCrest team={summary.homeTeam} size={44} />
                <span className="font-display text-base font-bold">
                  {summary.homeTeam?.name ?? 'TBD'}
                </span>
              </div>
              <div className="flex-none text-center">
                <div className="font-cond text-5xl font-bold tracking-widest text-white">
                  {scoreValue(summary, 'home')}
                  <span className="mx-1 text-text-faint">:</span>
                  {scoreValue(summary, 'away')}
                </div>
                <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-cond text-[13px] font-semibold tracking-wide ${statusPillClasses(summary)}`}>
                  {statusFullLabel(summary)}
                </div>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2.5 text-center">
                <TeamCrest team={summary.awayTeam} size={44} />
                <span className="font-display text-base font-bold">
                  {summary.awayTeam?.name ?? 'TBD'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {loading && <SkeletonCard />}
          {error && <ErrorCard message="Couldn't load match details." onRetry={onRetry} />}

          {!loading && !error && summary && (
            <>
              {goals.length > 0 && (
                <>
                  <div className="mb-2.5 font-display text-xs font-bold uppercase tracking-wide text-text-faint">
                    Goals
                  </div>
                  <div className="mb-5 flex flex-col gap-2.5">
                    {goals.map((g, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 ${g.isHome ? '' : 'flex-row-reverse text-right'}`}
                      >
                        <span className="w-[30px] flex-none text-center font-cond text-sm font-bold text-live">
                          {g.minute}'
                        </span>
                        <span className="text-sm text-text">{g.player}</span>
                        <span className="text-sm">⚽</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {Array.isArray(summary.statistics) && summary.statistics.length > 0 ? (
                <>
                  <div className="mb-3 font-display text-xs font-bold uppercase tracking-wide text-text-faint">
                    Match Stats
                  </div>
                  <div className="flex flex-col gap-3">
                    {summary.statistics.map((s, i) => (
                      <StatBar key={i} stat={s} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-border-2 bg-surface p-4 text-center text-sm text-text-muted">
                  No additional stats available for this match.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const StatBar = ({ stat }) => {
  const home = Number(stat.home) || 0
  const away = Number(stat.away) || 0
  const total = home + away || 1
  return (
    <div>
      <div className="mb-1.5 flex justify-between font-cond text-sm">
        <span className="font-bold text-text">{stat.home}</span>
        <span className="tracking-wide text-text-faint">{stat.label}</span>
        <span className="font-bold text-text">{stat.away}</span>
      </div>
      <div className="flex h-1.5 gap-1">
        <div className="rounded-sm bg-live" style={{ flex: home || 1, maxWidth: `${(home / total) * 100}%` }} />
        <div className="rounded-sm bg-border" style={{ flex: away || 1, maxWidth: `${(away / total) * 100}%` }} />
      </div>
    </div>
  )
}
