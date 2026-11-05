import { Skeleton, SkeletonStat } from '@/components/ui/skeleton';
import { LoadingAnnouncer } from '@/components/ui/skeleton';

export default function LaporanLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <LoadingAnnouncer label="Memuat laporan" />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton width={64} height={9} />
          <Skeleton width="min(260px, 56vw)" height={32} />
          <Skeleton width="min(200px, 42vw)" height={11} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={96} height={36} rounded="xl" />
          <Skeleton width={112} height={36} rounded="xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
            <Skeleton width={140} height={11} />
            <Skeleton width={90} height={8} className="mt-2" />
            <div className="mt-4 flex h-[180px] items-end gap-2">
              {[38, 62, 48, 84, 55, 92, 70, 46, 66, 88].map((h, j) => (
                <Skeleton key={j} className="flex-1" height={`${h}%`} rounded="sm" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card px-4 shadow-xs">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0">
            <Skeleton className="size-8 shrink-0" rounded="lg" />
            <Skeleton width={`${34 + (i % 3) * 10}%`} height={10} />
            <Skeleton className="ml-auto shrink-0" width={80} height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}
