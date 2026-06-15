import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today' },
  { to: '/groups', label: 'Standings' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/knockout', label: 'Bracket' },
]

export const TabNav = () => (
  <nav className="mx-auto flex max-w-[1060px] gap-0.5 overflow-x-auto px-2">
    {tabs.map((t) => (
      <NavLink
        key={t.to}
        to={t.to}
        end={t.to === '/'}
        className={({ isActive }) =>
          `flex-none whitespace-nowrap border-none bg-transparent px-4 py-3 font-display text-sm font-semibold tracking-wide transition-colors ${
            isActive ? 'text-text shadow-[inset_0_-2px_0_var(--color-live)]' : 'text-text-faint hover:text-text-dim'
          }`
        }
      >
        {t.label}
      </NavLink>
    ))}
  </nav>
)
