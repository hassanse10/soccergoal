import { useStandings } from '../hooks/useStandings'
import { GroupCard } from '../components/GroupCard'
import { SkeletonCard } from '../components/Skeleton'
import { ErrorCard, EmptyState } from '../components/ErrorCard'

export const Groups = () => {
  const { standings, loading, error, retry } = useStandings()

  const groups = standings.filter((s) => s.type === 'TOTAL')

  return (
    <div className="animate-fade">
      <div className="mb-4 flex items-baseline gap-2.5">
        <h3 className="m-0 font-display text-lg font-bold">Group Standings</h3>
        <span className="text-[12.5px] text-text-muted">
          Top 2 of each group advance · best 8 third-placed teams qualify
        </span>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {error && <ErrorCard message="Couldn't load standings." onRetry={retry} />}

      {!loading && !error && groups.length === 0 && (
        <EmptyState message="Standings aren't available yet." />
      )}

      {!loading && !error && groups.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {groups.map((g) => (
              <GroupCard key={g.group} group={g.group} table={g.table} />
            ))}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-4 px-1">
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2.5 w-2.5 rounded-sm bg-live" />
              Qualified for knockout
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#3C7A50]" />
              3rd · play-off place
            </span>
          </div>
        </>
      )}
    </div>
  )
}
