import { useMemo, useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import { useMatchDetail } from '../hooks/useMatchDetail'
import { Hero } from '../components/Hero'
import { NewsStrip } from '../components/NewsStrip'
import { Ticker } from '../components/Ticker'
import { MatchCard } from '../components/MatchCard'
import { MatchModal } from '../components/MatchModal'
import { SkeletonList } from '../components/Skeleton'
import { ErrorCard, EmptyState } from '../components/ErrorCard'

const SECTION_DEFS = [
  { key: 'live', title: 'Live', color: 'bg-live', statuses: ['IN_PLAY', 'PAUSED'] },
  { key: 'scheduled', title: 'Upcoming Today', color: 'bg-gold', statuses: ['SCHEDULED', 'TIMED'] },
  { key: 'finished', title: 'Finished', color: 'bg-text-muted', statuses: ['FINISHED'] },
]

export const Matches = () => {
  const { matches, loading, error, retry } = useMatches()
  const [selectedId, setSelectedId] = useState(null)
  const { match, loading: detailLoading, error: detailError, retry: retryDetail } = useMatchDetail(selectedId)

  const liveMatches = useMemo(() => matches.filter((m) => m.status === 'IN_PLAY' || m.status === 'PAUSED'), [matches])

  const sections = useMemo(
    () =>
      SECTION_DEFS.map((sec) => ({
        ...sec,
        matches: matches.filter((m) => sec.statuses.includes(m.status)),
      })).filter((sec) => sec.matches.length > 0),
    [matches]
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <SkeletonList rows={3} />
        <SkeletonList rows={3} />
      </div>
    )
  }

  if (error) return <ErrorCard message="Couldn't load today's matches." onRetry={retry} />

  if (matches.length === 0) return <EmptyState message="No matches scheduled for today." />

  return (
    <div className="animate-fade">
      <Hero liveMatches={liveMatches} onSelect={(m) => setSelectedId(m.id)} />
      <NewsStrip />
      <Ticker matches={matches} onSelect={(m) => setSelectedId(m.id)} />

      {sections.map((sec) => (
        <div key={sec.key}>
          <div className="my-5 flex items-center gap-2.5">
            <span className={`h-1.5 w-1.5 rounded-sm ${sec.color}`} />
            <h3 className="m-0 font-display text-sm font-bold uppercase tracking-wide text-text-dim">
              {sec.title}
            </h3>
            <span className="font-cond text-sm text-text-faint">{sec.matches.length}</span>
            <div className="h-px flex-1 bg-border-2" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-border-2 bg-surface-2">
            {sec.matches.map((m) => (
              <MatchCard key={m.id} match={m} onClick={(match) => setSelectedId(match.id)} />
            ))}
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
