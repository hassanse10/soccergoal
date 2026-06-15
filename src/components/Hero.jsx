import { useState } from 'react'
import { TeamCrest } from './TeamCrest'
import { TeamSquadPanel } from './TeamSquadPanel'
import { getLead, scoreColor, scoreValue, teamDim } from '../utils/matchHelpers'
import { groupLabel } from '../utils/formatDate'
import { useTeamSquad } from '../hooks/useTeamSquad'

export const Hero = ({ liveMatches, onSelect }) => {
  const [expanded, setExpanded] = useState({})
  const { data: squads, loading: squadLoading, error: squadError, load: loadSquad } = useTeamSquad()

  if (!liveMatches || liveMatches.length === 0) return null

  const toggleTeam = (matchId, side, teamId) => {
    setExpanded((prev) => ({ ...prev, [matchId]: prev[matchId] === side ? null : side }))
    loadSquad(teamId)
  }

  return (
    <section className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-[radial-gradient(120%_140%_at_0%_0%,#102433_0%,#0C141C_55%,#0A1118_100%)] p-4 pb-1.5 shadow-[0_18px_50px_-28px_rgba(0,200,83,.35)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="animate-sheen absolute left-0 top-0 h-full w-[38%] bg-[linear-gradient(100deg,transparent,rgba(0,200,83,.10),transparent)]" />
      </div>

      <div className="relative mb-3.5 flex items-center gap-3">
        <div className="flex h-[18px] items-end gap-[3px]">
          {[0, 0.18, 0.36, 0.54].map((delay, i) => (
            <span
              key={i}
              className="animate-eq w-[3px] rounded-sm bg-live"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>
        <h2 className="m-0 font-display text-[17px] font-bold tracking-wider text-white">LIVE NOW</h2>
        <span className="font-cond text-[13px] tracking-wide text-text-faint">
          {liveMatches.length} match{liveMatches.length === 1 ? '' : 'es'} in play
        </span>
      </div>

      <div className="relative flex gap-3 overflow-x-auto pb-3.5 [scroll-snap-type:x_mandatory]">
        {liveMatches.map((m) => {
          const lead = getLead(m)
          const openSide = expanded[m.id]
          const openTeam = openSide === 'home' ? m.homeTeam : openSide === 'away' ? m.awayTeam : null
          return (
            <div
              key={m.id}
              onClick={() => onSelect?.(m)}
              className="flex-none w-[288px] cursor-pointer rounded-xl border border-border bg-[linear-gradient(180deg,#121B24,#0E151C)] p-4 transition-[border-color,transform] [scroll-snap-align:start] hover:-translate-y-0.5 hover:border-[#37536B]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-cond text-xs tracking-wide text-text-faint">{groupLabel(m.group)}</span>
                <span className="flex items-center gap-1.5 rounded-md bg-live-bg px-2 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-live" />
                  <span className="font-cond text-xs font-semibold tracking-wide text-live">
                    {m.status === 'PAUSED' ? 'HT' : `${m.minute ?? ''}'`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <HeroTeam
                    team={m.homeTeam}
                    dim={teamDim(m.status, lead.h)}
                    open={openSide === 'home'}
                    onToggle={(e) => {
                      e.stopPropagation()
                      toggleTeam(m.id, 'home', m.homeTeam?.id)
                    }}
                  />
                  <HeroTeam
                    team={m.awayTeam}
                    dim={teamDim(m.status, lead.a)}
                    open={openSide === 'away'}
                    onToggle={(e) => {
                      e.stopPropagation()
                      toggleTeam(m.id, 'away', m.awayTeam?.id)
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 font-cond text-3xl font-bold leading-none tracking-wide">
                  <span className={`${scoreColor(m.status, lead.h)} ${teamDim(m.status, lead.h)}`}>{scoreValue(m, 'home')}</span>
                  <span className={`${scoreColor(m.status, lead.a)} ${teamDim(m.status, lead.a)}`}>{scoreValue(m, 'away')}</span>
                </div>
              </div>

              {openTeam && (
                <TeamSquadPanel
                  data={squads[openTeam.id]}
                  loading={!!squadLoading[openTeam.id]}
                  error={squadError[openTeam.id]}
                />
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

const HeroTeam = ({ team, dim, open, onToggle }) => (
  <div className={`flex min-w-0 items-center gap-2.5 ${dim}`}>
    <TeamCrest team={team} />
    <span className="truncate font-display text-base font-semibold">{team?.name ?? team?.shortName ?? 'TBD'}</span>
    {team?.id && (
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? 'Hide squad' : 'Show squad'}
        className="ml-auto flex h-5 w-5 flex-none items-center justify-center rounded-md text-text-faint transition-colors hover:bg-border-2 hover:text-text"
      >
        <svg
          viewBox="0 0 16 16"
          width="11"
          height="11"
          className={`fill-current transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )}
  </div>
)
