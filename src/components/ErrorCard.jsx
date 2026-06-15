export const ErrorCard = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-2 bg-surface-2 p-8 text-center">
    <div className="text-2xl">⚠️</div>
    <p className="text-sm text-text-muted">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg border border-border bg-surface px-4 py-2 font-display text-sm font-semibold text-text transition-colors hover:border-live"
      >
        Retry
      </button>
    )}
  </div>
)

export const EmptyState = ({ message = 'Nothing to show yet.' }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-border-2 bg-surface-2 p-10 text-center">
    <div className="text-2xl">⚽</div>
    <p className="text-sm text-text-muted">{message}</p>
  </div>
)
