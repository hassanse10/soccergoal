import { groupSquad, GROUP_LABELS } from '../utils/squad'

export const TeamSquadPanel = ({ data, loading, error }) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 mt-3 animate-fade rounded-lg border border-border-2 bg-surface-2/60 p-3"
    >
      {loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-3 w-full animate-skeleton rounded bg-border-2" />
          ))}
        </div>
      )}

      {error && <p className="font-cond text-xs text-red">Couldn't load squad details.</p>}

      {data && (
        <>
          {data.coach?.name && (
            <p className="mb-2 font-cond text-xs text-text-faint">
              Coach: <span className="text-text">{data.coach.name}</span>
              {data.coach.nationality ? ` (${data.coach.nationality})` : ''}
            </p>
          )}
          <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1 no-scrollbar">
            {Object.entries(groupSquad(data.squad)).map(
              ([group, players]) =>
                players.length > 0 && (
                  <div key={group}>
                    <p className="mb-1 font-cond text-[11px] font-semibold tracking-wider text-text-faint">
                      {GROUP_LABELS[group]}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {players.map((p) => (
                        <span
                          key={p.id}
                          className="rounded bg-surface px-1.5 py-0.5 font-cond text-[11px] text-text-muted"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </>
      )}
    </div>
  )
}
