import { useMemo, useState } from 'react'
import { useAllMatches } from '../hooks/useAllMatches'
import { useMatchDetail } from '../hooks/useMatchDetail'
import { TeamCrest } from '../components/TeamCrest'
import { MatchModal } from '../components/MatchModal'
import { SkeletonList } from '../components/Skeleton'
import { ErrorCard, EmptyState } from '../components/ErrorCard'
import { mapStatus } from '../utils/mapStatus'
import { scoreValue } from '../utils/matchHelpers'
import { dateKey, formatDateLong, formatTime, groupLabel, isToday } from '../utils/formatDate'

export const Schedule = () => {
  const { matches, loading, error, retry } = useAllMatches()
  const [selectedId, setSelectedId] = useState(null)
  const { match, loading: detailLoading, error: detailError, retry: retryDetail } = useMatchDetail(selectedId)

  const days = useMemo(() => {
    const byDate = new Map()
    matches.forEach((m) => {
      const key = dateKey(m.utcDate)
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key).push(m)
    })
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, ms]) => ({
        key,
        label: formatDateLong(ms[0].utcDate),
        today: isToday(ms[0].utcDate),
        matches: ms.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate)),
      }))
  }, [matches])

  if (loading) return <SkeletonList rows={6} />
  if (error) return <ErrorCard message="Couldn't load the schedule." onRetry={retry} />
  if (days.length === 0) return <EmptyState message="No fixtures available." />

  return (
    <div className="animate-fade">
      <h3 className="m-0 mb-4 font-display text-lg font-bold">Schedule</h3>
      {days.map((day) => (
        <div key={day.key}>
          <div className="my-4 flex items-center gap-2.5">
            <h4
              className={`m-0 font-display text-[13px] font-bold uppercase tracking-wide ${
                day.today ? 'text-live' : 'text-gold'
              }`}
            >
              {day.label}
              {day.today ? ' · Today' : ''}
            </h4>
            <div className="h-px flex-1 bg-border-2" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border-2 bg-surface-2">
            {day.matches.map((m) => {
              const status = mapStatus(m)
              const finished = status.kind === 'finished'
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className="flex cursor-pointer items-center gap-2.5 border-b border-border-2 px-3.5 py-3 transition-colors last:border-b-0 hover:bg-surface"
                >
                  <div className={`w-12 flex-none text-center font-cond text-sm font-semibold ${status.color}`}>
                    {finished ? 'FT' : formatTime(m.utcDate)}
                  </div>
                  <div className="h-full w-px flex-none self-stretch bg-border-2" />
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-right">
                      <span className="truncate font-display text-sm font-semibold">{m.homeTeam?.name ?? 'TBD'}</span>
                      <TeamCrest team={m.homeTeam} size={18} />
                      {finished && <span className="font-cond text-base font-bold text-text">{scoreValue(m, 'home')}</span>}
                    </div>
                    <span className="flex-none font-cond text-xs text-text-faint">v</span>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {finished && <span className="font-cond text-base font-bold text-text">{scoreValue(m, 'away')}</span>}
                      <TeamCrest team={m.awayTeam} size={18} />
                      <span className="truncate font-display text-sm font-semibold">{m.awayTeam?.name ?? 'TBD'}</span>
                    </div>
                  </div>
                  <div className="w-16 flex-none text-right font-cond text-[11px] tracking-wide text-text-faint">
                    {groupLabel(m.group)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {selectedId && (
        <MatchModal
          match={match}
          loading={detailLoading}
          error={detailError}
          onClose={() => setSelectedId(null)}
          onRetry={retryDetail}
        />
      )}
    </div>
  )
}
