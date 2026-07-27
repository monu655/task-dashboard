export function TableSkeleton({ rows = 6, columns = 8 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-slate-100 px-4 py-4">
          {Array.from({ length: columns }).map((__, c) => (
            <div key={c} className="h-4 flex-1 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 h-3 w-20 rounded bg-slate-200" />
      <div className="h-8 w-16 rounded bg-slate-200" />
    </div>
  );
}
