import { Skeleton } from '@/components/ui/skeleton';

/** Kerangka halaman pengaturan: kartu identitas, lalu beberapa panel formulir. */
export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Skeleton width={72} height={9} />
        <Skeleton width="min(220px, 48vw)" height={32} />
        <Skeleton width="min(260px, 56vw)" height={11} />
      </div>

      {/* Identitas */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 shrink-0" rounded="full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton width="38%" height={14} />
            <Skeleton width="52%" height={10} />
          </div>
          <Skeleton width={72} height={20} rounded="full" />
        </div>
      </div>

      {[3, 2].map((fields, panel) => (
        <div key={panel} className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
          <Skeleton width={160} height={12} className="mb-1.5" />
          <Skeleton width={220} height={8} className="mb-4" />
          <div className="grid gap-3.5 sm:grid-cols-2">
            {Array.from({ length: fields }, (_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton width={84} height={9} />
                <Skeleton height={42} rounded="xl" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <Skeleton width={92} height={38} rounded="xl" />
            </div>
          </div>
        </div>
      ))}

      {/* Daftar kategori */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
        <Skeleton width={128} height={12} className="mb-3" />
        <div className="divide-y divide-border/60">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5">
              <Skeleton className="size-7 shrink-0" rounded="lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton width={`${40 + (i % 3) * 12}%`} height={10} />
                <Skeleton width="24%" height={8} />
              </div>
              <Skeleton width={52} height={16} rounded="full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
