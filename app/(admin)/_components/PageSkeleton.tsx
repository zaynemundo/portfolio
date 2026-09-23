/**
 * Generic instant-loading placeholder for admin pages. Next.js renders this
 * immediately on navigation (via each route's loading.tsx) while the actual
 * page's data request is still in flight — the DB round-trip itself doesn't
 * get any faster, but the navigation no longer looks frozen/blank while it
 * resolves.
 */
export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 rounded bg-zinc-800/70 mb-2" />
      <div className="h-4 w-64 rounded bg-zinc-800/50 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-zinc-800 bg-zinc-900/40" />
        ))}
      </div>
    </div>
  );
}
