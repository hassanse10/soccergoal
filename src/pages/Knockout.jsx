import { useKnockout } from '../hooks/useKnockout'
import { Bracket } from '../components/Bracket'
import { SkeletonCard } from '../components/Skeleton'
import { ErrorCard } from '../components/ErrorCard'

export const Knockout = () => {
  const { stages, loading, error, retry } = useKnockout()

  return (
    <div className="animate-fade">
      <div className="mb-4 flex items-baseline gap-2.5">
        <h3 className="m-0 font-display text-lg font-bold">Knockout Bracket</h3>
        <span className="text-[12.5px] text-text-muted">Round of 32 through the Final</span>
      </div>

      <div className="mb-5 rounded-2xl border border-border bg-[radial-gradient(110%_130%_at_50%_0%,#13202B,#0C131A)] p-5 text-center">
        <div className="font-cond text-[13px] tracking-wide text-text-faint">THE FINAL · JUL 19, 2026</div>
        <div className="mt-1 font-display text-xl font-bold text-white">MetLife Stadium</div>
        <div className="text-[12.5px] text-text-muted">New York / New Jersey</div>
      </div>

      {loading && (
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="w-[260px] flex-none" />
          ))}
        </div>
      )}

      {error && <ErrorCard message="Couldn't load the bracket." onRetry={retry} />}

      {!loading && !error && <Bracket stages={stages} />}
    </div>
  )
}
