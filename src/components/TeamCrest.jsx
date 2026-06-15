export const TeamCrest = ({ team, size = 22 }) => {
  if (team?.crest) {
    return (
      <img
        src={team.crest}
        alt=""
        width={size}
        height={size}
        className="flex-none rounded-sm object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden'
        }}
      />
    )
  }
  return (
    <span
      className="flex flex-none items-center justify-center rounded-sm bg-border-2 text-[10px] font-bold text-text-faint"
      style={{ width: size, height: size }}
    >
      ?
    </span>
  )
}
