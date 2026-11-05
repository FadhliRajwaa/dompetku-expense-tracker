import { Skeleton, SkeletonStat, SkeletonText } from '@/components/ui/skeleton';

/**
 * Kerangka dashboard.
 *
 * Susunannya mengikuti halaman asli — kartu saldo gelap, dua kartu metrik,
 * grafik, dompet, anggaran, transaksi — sehingga tidak ada lompatan saat data
 * sungguhan masuk. Ukuran tinggi tiap blok sengaja sama dengan elemen aslinya.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {/* Judul halaman */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton width={72} height={9} />
          <Skeleton width="min(280px, 58vw)" height={32} />
          <Skeleton width="min(220px, 44vw)" height={11} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={126} height={36} rounded="xl" />
          <Skeleton width={104} height={36} rounded="xl" />
        </div>
      </div>

      {/* Saldo + metrik */}
      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <div className="skeleton h-[188px] rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonStat />
          <SkeletonStat />
          <div className="col-span-2 rounded-xl border border-border/70 bg-card px-4 py-3">
            <Skeleton width="38%" height={9} className="mb-2.5" />
            <Skeleton width="52%" height={14} />
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton width={120} height={11} />
                <Skeleton width={80} height={8} />
              </div>
              <Skeleton width={64} height={22} rounded="full" />
            </div>
            {/* Batang grafik dengan tinggi bervariasi, seperti data sungguhan */}
            <div className="mt-4 flex h-[132px] items-end gap-2">
              {[42, 68, 54, 88, 61, 96, 74, 58].map((h, j) => (
                <Skeleton key={j} className="flex-1" height={`${h}%`} rounded="sm" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dompet + anggaran */}
      <div className="grid gap-3 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
          >
            <Skeleton width={140} height={12} className="mb-3" />
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="size-10 shrink-0" rounded="xl" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton width="46%" height={10} />
                    <Skeleton height={5} rounded="full" />
                  </div>
                  <Skeleton className="shrink-0" width={72} height={12} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Transaksi terakhir */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <Skeleton width={156} height={12} className="mb-2" />
        <div className="divide-y divide-border/60">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-9 shrink-0" rounded="lg" />
              <div className="min-w-0 flex-1">
                <SkeletonText lines={2} lineHeight={10} />
              </div>
              <Skeleton className="shrink-0" width={64} height={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
