import { TeamCrest } from './TeamCrest'
import { groupLabel } from '../utils/formatDate'

export const GroupCard = ({ group, table }) => {
  const letter = groupLabel(group).replace('Group ', '')

  return (
    <div className="overflow-hidden rounded-2xl border border-border-2 bg-surface-2">
      <div className="flex items-center gap-2.5 border-b border-border-2 bg-[linear-gradient(90deg,#13202B,#0E141B)] px-3.5 py-2.5">
        <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-md bg-live font-cond text-[13px] font-bold text-[#06222F]">
          {letter}
        </span>
        <span className="font-display text-[13.5px] font-semibold tracking-wide text-text-dim">
          Group {letter}
        </span>
        <div className="flex-1" />
        <div className="flex w-[118px] justify-between gap-2.5 pr-0.5 font-cond text-[11px] tracking-wide text-text-faint">
          <span className="w-[18px] text-center">P</span>
          <span className="w-[18px] text-center">GD</span>
          <span className="w-[18px] text-center text-text-muted">PTS</span>
        </div>
      </div>
      {table.map((row, i) => {
        const qualified = row.position <= 2
        const playoff = row.position === 3
        return (
          <div
            key={row.team?.id ?? i}
            className="flex items-center gap-2.5 border-b border-border-2 px-3.5 py-2.5 last:border-b-0"
            style={{
              boxShadow: qualified
                ? 'inset 3px 0 0 var(--color-live)'
                : playoff
                ? 'inset 3px 0 0 #3C7A50'
                : 'none',
            }}
          >
            <span
              className="w-3.5 flex-none font-cond text-xs font-semibold"
              style={{ color: qualified ? 'var(--color-live)' : playoff ? '#5FA877' : '#69727E' }}
            >
              {row.position}
            </span>
            <TeamCrest team={row.team} />
            <span className="min-w-0 flex-1 truncate font-display text-sm font-semibold">
              {row.team?.shortName ?? row.team?.name}
            </span>
            <div className="flex w-[118px] justify-between gap-2.5 font-cond text-[13.5px] text-text-muted">
              <span className="w-[18px] text-center">{row.playedGames}</span>
              <span
                className="w-[18px] text-center"
                style={{
                  color:
                    row.goalDifference > 0 ? '#7FB89A' : row.goalDifference < 0 ? '#C58B8B' : '#69727E',
                }}
              >
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </span>
              <span className="w-[18px] text-center font-bold text-gold">{row.points}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
