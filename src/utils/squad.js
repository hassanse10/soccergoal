// Groups a squad list into broad position buckets for display.
export const groupSquad = (squad = []) => {
  const groups = { Goalkeepers: [], Defenders: [], Midfielders: [], Forwards: [] }
  squad.forEach((p) => {
    const pos = p.position ?? ''
    if (pos.includes('Goalkeeper')) groups.Goalkeepers.push(p)
    else if (pos.includes('Back') || pos.includes('Defence')) groups.Defenders.push(p)
    else if (pos.includes('Midfield')) groups.Midfielders.push(p)
    else groups.Forwards.push(p)
  })
  return groups
}

export const GROUP_LABELS = {
  Goalkeepers: 'GK',
  Defenders: 'DEF',
  Midfielders: 'MID',
  Forwards: 'FWD',
}
