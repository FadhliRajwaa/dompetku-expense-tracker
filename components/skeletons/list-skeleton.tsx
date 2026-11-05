import { Skeleton, SkeletonRow, SkeletonStat } from '@/components/ui/skeleton';

/**
 * Kerangka umum untuk halaman bertipe daftar (transaksi, dompet, anggaran,
 * target, berulang, aktivitas, keluarga).
 *
 * `variant` menentukan bentuk isi, bukan strukturnya — header dan ringkasan
 * selalu sama sehingga transisi antar halaman terasa konsisten.
 */
export function ListSkeleton({
  variant = 'rows',
  rows = 6,
  stats = 3,
}: {
  variant?: 'rows' | 'cards' | 'table';
  rows?: number;
  stats?: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Judul */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton width={68} height={9} />
          <Skeleton width="min(240px, 52vw)" height={32} />
          <Skeleton width="min(190px, 40vw)" height={11} />
        </div>
        <Skeleton width={132} height={36} rounded="xl" />
      </div>

      {/* Ringkasan */}
      {stats > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: stats }, (_, i) => (
            <SkeletonStat key={i} className={i === 2 ? 'col-span-2 sm:col-span-1' : ''} />
          ))}
        </div>
      )}

      {/* Filter / pencarian */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Skeleton className="flex-1" height={40} rounded="xl" />
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Skeleton width={140} height={36} rounded="xl" />
            <Skeleton width={150} height={36} rounded="xl" />
            <Skeleton width={92} height={36} rounded="xl" />
          </div>
        </div>
      </div>

      {/* Isi */}
      {variant === 'rows' && (
        <div className="rounded-2xl border border-border/70 bg-card px-4 shadow-xs">
          {Array.from({ length: rows }, (_, i) => (
            <SkeletonRow key={i} className="border-b border-border/60 last:border-0" />
          ))}
        </div>
      )}

      {variant === 'table' && (
        <>
          {/* Desktop: tabel. Kolom memakai lebar tetap yang sama di header dan
              baris, supaya garis kolomnya benar-benar sejajar. */}
          <div className="hidden overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs sm:block">
            <div className="flex items-center gap-4 border-b border-border/70 bg-muted/40 px-4 py-2.5">
              <Skeleton width={78} height={8} className="shrink-0" />
              <Skeleton height={8} className="min-w-0 flex-1" />
              <Skeleton width={104} height={8} className="shrink-0" />
              <Skeleton width={96} height={8} className="shrink-0" />
              <Skeleton width={44} height={8} className="shrink-0" />
            </div>
            {Array.from({ length: rows }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5 last:border-0"
              >
                <Skeleton width={78} height={10} className="shrink-0" />
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Skeleton className="size-7 shrink-0" rounded="lg" />
                  <Skeleton width={`${70 - (i % 3) * 12}%`} height={10} />
                </div>
                <Skeleton width={104} height={10} className="shrink-0" />
                <Skeleton width={96} height={10} className="shrink-0" />
                <Skeleton width={44} height={10} className="shrink-0" />
              </div>
            ))}
          </div>

          {/* HP: kartu, sama seperti tampilan aslinya. */}
          <div className="flex flex-col gap-2 sm:hidden">
            {Array.from({ length: Math.min(rows, 6) }, (_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs"
              >
                <Skeleton className="size-9 shrink-0" rounded="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Skeleton width={`${54 + (i % 3) * 12}%`} height={10} />
                  <Skeleton width="42%" height={8} />
                  <Skeleton width="26%" height={7} />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Skeleton width={62} height={10} />
                  <Skeleton width={34} height={8} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {variant === 'cards' && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <Skeleton className="size-9 shrink-0" rounded="lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton width="58%" height={11} />
                  <Skeleton width="38%" height={8} />
                </div>
                <Skeleton width={40} height={16} rounded="full" />
              </div>
              <Skeleton width="52%" height={18} className="mt-3" />
              <Skeleton height={5} rounded="full" className="mt-2" />
              <Skeleton width="34%" height={8} className="mt-1.5" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="flex-1" height={34} rounded="lg" />
                <Skeleton width={36} height={34} rounded="lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
