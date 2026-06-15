import { Routes, Route } from 'react-router-dom'
import { TabNav } from './components/TabNav'
import { Matches } from './pages/Matches'
import { Groups } from './pages/Groups'
import { Schedule } from './pages/Schedule'
import { Knockout } from './pages/Knockout'

function App() {
  return (
    <div className="min-h-screen bg-bg font-sans text-text" style={{ WebkitFontSmoothing: 'antialiased' }}>
      <header className="sticky top-0 z-40 border-b border-border-2 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1060px] items-center gap-3.5 px-4.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-[linear-gradient(135deg,#1FB6FF,#0E7FC0)] shadow-[0_4px_14px_rgba(31,182,255,.32)]">
              <span className="font-cond text-[19px] font-bold tracking-tighter text-[#06222F]">26</span>
            </div>
            <div className="min-w-0">
              <div className="whitespace-nowrap font-display text-base font-bold leading-tight tracking-wide">
                FIFA WORLD CUP <span className="text-live">26</span>
              </div>
              <div className="whitespace-nowrap text-[11px] tracking-wide text-text-faint">
                USA · CANADA · MEXICO
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex flex-none items-center gap-1.5 rounded-full border border-live/30 bg-live-bg px-2.5 py-1.5">
            <span className="h-2 w-2 flex-none animate-pulse-dot rounded-full bg-live" />
            <span className="font-cond text-[13px] font-semibold tracking-wide text-live">LIVE</span>
          </div>
        </div>
        <TabNav />
      </header>

      <main className="mx-auto max-w-[1060px] px-4.5 py-4.5">
        <Routes>
          <Route path="/" element={<Matches />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/knockout" element={<Knockout />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
