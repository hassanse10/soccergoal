import { useNews } from '../hooks/useNews'

export function NewsStrip() {
  const { headlines } = useNews()
  if (headlines.length === 0) return null

  return (
    <div className="mb-3 flex overflow-hidden rounded-xl border border-border-2 bg-surface-2">
      <div className="flex flex-none items-center border-r border-border-2 bg-surface px-3 py-2">
        <span className="font-cond text-[11px] font-semibold tracking-widest text-text-faint">
          NEWS
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-scroll flex w-max">
          {[...headlines, ...headlines].map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-none items-center gap-2 border-r border-border-2 px-4 py-2 transition-colors hover:bg-surface"
            >
              <span className="font-cond text-[11px] text-text-faint">
                {article.source?.name}
              </span>
              <span className="max-w-[320px] truncate font-cond text-[12px] text-text">
                {article.title}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
