import { cn } from '@/lib/utils'

const PAGE_SIZES = [5, 10, 20, 50]

export function Pagination({ page, totalItems, pageSize = 5, onPageSizeChange, onChange }: {
  page: number
  totalItems: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const from = totalItems === 0 ? 0 : page * pageSize + 1
  const to   = Math.min((page + 1) * pageSize, totalItems)

  const maxBtns = 5
  let start = Math.max(0, page - Math.floor(maxBtns / 2))
  const end = Math.min(totalPages - 1, start + maxBtns - 1)
  if (end - start < maxBtns - 1) start = Math.max(0, end - maxBtns + 1)
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-between gap-3 pt-2 flex-wrap text-xs text-zinc-500">
      <div className="flex items-center gap-2">
        <span>{from}–{to} de {totalItems}</span>
        {onPageSizeChange && (
          <>
            <span className="text-zinc-700">·</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 rounded-md bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs focus:outline-none cursor-pointer"
            >
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} por pág</option>)}
            </select>
          </>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-1">
          <button onClick={() => onChange(0)} disabled={page === 0} className="h-8 px-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-xs">«</button>
          <button onClick={() => onChange(page - 1)} disabled={page === 0} className="h-8 px-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-xs">‹</button>
          {start > 0 && <span className="flex items-center px-1 text-zinc-600">…</span>}
          {pages.map(i => (
            <button key={i} onClick={() => onChange(i)}
              className={cn('h-8 px-2.5 rounded-lg text-xs', i === page ? 'bg-white text-zinc-900 font-medium' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700')}>
              {i + 1}
            </button>
          ))}
          {end < totalPages - 1 && <span className="flex items-center px-1 text-zinc-600">…</span>}
          <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="h-8 px-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-xs">›</button>
          <button onClick={() => onChange(totalPages - 1)} disabled={page >= totalPages - 1} className="h-8 px-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-xs">»</button>
        </div>
      )}
    </div>
  )
}
