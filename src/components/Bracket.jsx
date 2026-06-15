import { TeamCrest } from './TeamCrest'
import { mapStatus } from '../utils/mapStatus'
import { scoreValue } from '../utils/matchHelpers'
import { STAGE_LABELS, STAGES } from '../utils/stages'

const BracketTeam = ({ team, score }) => (
  <div className="flex items-center gap-2.5">
    {team ? (
      <>
        <TeamCrest team={team} size={20} />
        <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">{team.name}</span>
      </>
    ) : (
      <span className="min-w-0 flex-1 truncate font-display text-sm italic text-text-faint">TBD</span>
    )}
    {score !== undefined && <span className="font-cond text-sm font-bold text-text">{score}</span>}
  </div>
)

const BracketMatch = ({ match }) => {
  const status = mapStatus(match)
  const showScore = status.kind === 'live' || status.kind === 'finished'
  return (
    <div className="rounded-xl border border-border-2 bg-surface-2 p-3.5">
      <div className="mb-2.5 flex items-center justify-between font-cond text-xs tracking-wide text-text-faint">
        <span>{match.venue ?? ' '}</span>
        <span className={status.kind === 'live' ? 'text-live' : ''}>{status.label}</span>
      </div>
      <div className="flex flex-col gap-2">
        <BracketTeam team={match.homeTeam} score={showScore ? scoreValue(match, 'home') : undefined} />
        <BracketTeam team={match.awayTeam} score={showScore ? scoreValue(match, 'away') : undefined} />
      </div>
    </div>
  )
}

export const BracketColumn = ({ stage, matches }) => (
  <div className="w-[260px] flex-none">
    <div className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-text-dim">
      {STAGE_LABELS[stage] ?? stage}
    </div>
    <div className="flex flex-col gap-3">
      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-2 p-4 text-center text-sm italic text-text-faint">
          TBD
        </div>
      ) : (
        matches.map((m) => <BracketMatch key={m.id} match={m} />)
      )}
    </div>
  </div>
)

export const Bracket = ({ stages }) => (
  <div className="flex gap-4 overflow-x-auto pb-3">
    {STAGES.map((stage) => (
      <BracketColumn key={stage} stage={stage} matches={stages[stage] ?? []} />
    ))}
  </div>
)
