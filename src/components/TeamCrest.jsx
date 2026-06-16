import { useState, useEffect } from 'react'
import { getTheSportsDBCrest } from '../services/theSportsDB'

export const TeamCrest = ({ team, size = 22 }) => {
  const [fallbackSrc, setFallbackSrc] = useState(null)
  const [failed, setFailed] = useState(false)

  // When there is no primary crest URL at all, try TheSportsDB immediately.
  useEffect(() => {
    if (!team?.crest && team?.name) {
      getTheSportsDBCrest(team.name)
        .then((url) => { if (url) setFallbackSrc(url) })
        .catch(() => {})
    }
  }, [team?.crest, team?.name])

  // When the primary crest URL exists but fails to load, try TheSportsDB.
  const handleError = async () => {
    if (fallbackSrc !== null) {
      setFailed(true)
      return
    }
    try {
      const url = await getTheSportsDBCrest(team?.name)
      if (url) {
        setFallbackSrc(url)
      } else {
        setFailed(true)
      }
    } catch {
      setFailed(true)
    }
  }

  const src = fallbackSrc ?? team?.crest

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="flex-none rounded-sm object-contain"
        loading="lazy"
        onError={handleError}
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
