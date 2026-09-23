import React from "react";

/**
 * Loading placeholders.
 *
 * The blocks must carry their own grey fill: `animate-pulse` only varies
 * opacity, so a white box on a white page pulses invisibly and reads as an
 * empty card rather than as loading.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

/** A card-shaped placeholder with the page's card chrome around it. */
export function SkeletonCard({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/** One stat tile: small label above a large figure. */
export function SkeletonStat() {
  return (
    <SkeletonCard className="h-24 flex flex-col justify-center gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-16" />
    </SkeletonCard>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

/** A table placeholder: header strip plus evenly spaced rows. */
export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="px-4 py-3.5 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={col}
                className={`h-3.5 ${col === 0 ? "w-24" : "flex-1"}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardSkeletonProps {
  /** Stat tiles across the top. */
  stats?: number;
  /** Panels below the tiles. */
  panels?: number;
  /** Render the lower half as a table rather than panels. */
  withTable?: boolean;
}

/**
 * Whole-dashboard placeholder, shaped like the page it stands in for: title,
 * a row of stat tiles, then the panels or table below.
 */
export function DashboardSkeleton({
  stats = 5,
  panels = 3,
  withTable = false,
}: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-72" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: stats }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>

        {withTable ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <SkeletonTable rows={5} columns={4} />
            </div>
            <SkeletonCard className="space-y-3">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 py-1">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </SkeletonCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: panels }).map((_, i) => (
              <SkeletonCard key={i} className="h-48 space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </SkeletonCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Skeleton;
