export const SkeletonBar = ({ className = '' }) => (
  <div className={`animate-skeleton rounded-md bg-surface ${className}`} />
)

export const SkeletonMatchRow = () => (
  <div className="flex items-center gap-2 border-b border-border-2 p-3.5">
    <SkeletonBar className="h-8 w-[54px] flex-none" />
    <div className="h-full w-px flex-none bg-border-2" />
    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
      <SkeletonBar className="h-4 w-full" />
      <SkeletonBar className="h-4 w-3/4" />
    </div>
  </div>
)

export const SkeletonList = ({ rows = 3 }) => (
  <div className="overflow-hidden rounded-2xl border border-border-2 bg-surface-2">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonMatchRow key={i} />
    ))}
  </div>
)

export const SkeletonCard = ({ className = '' }) => (
  <div className={`rounded-2xl border border-border-2 bg-surface-2 p-4 ${className}`}>
    <SkeletonBar className="mb-3 h-4 w-1/3" />
    <SkeletonBar className="mb-2 h-4 w-full" />
    <SkeletonBar className="mb-2 h-4 w-full" />
    <SkeletonBar className="h-4 w-full" />
  </div>
)
