import { TeamCrest } from './TeamCrest'
import { mapStatus } from '../utils/mapStatus'
import { getLead, scoreColor, scoreValue, teamDim } from '../utils/matchHelpers'
import { groupLabel } from '../utils/formatDate'
import { useVenueWeather } from '../hooks/useVenueWeather'

export const MatchCard = ({ match, onClick }) => {
  const status = mapStatus(match)
  const lead = getLead(match)
  const { temp, icon } = useVenueWeather(match.venue)

  return (
    <div
      onClick={() => onClick?.(match)}
      className="flex cursor-pointer items-center gap-2 border-b border-border-2 px-3.5 py-3 transition-colors last:border-b-0 hover:bg-surface"
    >
      <div className="w-[54px] flex-none text-center">
        <div className={`flex items-center justify-center gap-1.5 font-cond text-sm font-semibold tracking-wide ${status.color}`}>
          {status.kind === 'live' && (
            <span className="h-1.5 w-1.5 flex-none animate-pulse-dot rounded-full bg-live" />
          )}
          {status.label}
        </div>
        <div className="mt-0.5 font-cond text-[10px] tracking-wide text-text-faint">
          {groupLabel(match.group)}
        </div>
      </div>
      <div className="h-full w-px flex-none self-stretch bg-border-2" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <TeamRow team={match.homeTeam} score={scoreValue(match, 'home')} dim={teamDim(match.status, lead.h)} scoreColorClass={scoreColor(match.status, lead.h)} />
        <TeamRow team={match.awayTeam} score={scoreValue(match, 'away')} dim={teamDim(match.status, lead.a)} scoreColorClass={scoreColor(match.status, lead.a)} />
      </div>
      {temp !== null && (
        <span className="flex-none font-cond text-xs text-text-faint">
          {temp}° {icon}
        </span>
      )}
      <div className="w-3.5 flex-none text-right text-lg text-text-faint">›</div>
    </div>
  )
}

const TeamRow = ({ team, score, dim, scoreColorClass }) => (
  <div className="flex min-w-0 items-center gap-2.5">
    <TeamCrest team={team} />
    <span className={`min-w-0 flex-1 truncate font-display text-[15.5px] font-semibold ${dim}`}>
      {team?.name ?? team?.shortName ?? 'TBD'}
    </span>
    <span className={`w-[18px] flex-none text-center font-cond text-lg font-bold ${scoreColorClass} ${dim}`}>
      {score}
    </span>
  </div>
)
