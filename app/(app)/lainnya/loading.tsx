import { LoadingAnnouncer, Skeleton } from '@/components/ui/skeleton';

export default function LainnyaLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <LoadingAnnouncer label="Memuat menu" />
      <div className="flex flex-col gap-2">
        <Skeleton width={72} height={9} />
        <Skeleton width="min(180px, 44vw)" height={32} />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5"
          >
            <Skeleton className="size-10 shrink-0" rounded="lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton width={`${32 + (i % 4) * 8}%`} height={11} />
              <Skeleton width={`${48 + (i % 3) * 10}%`} height={8} />
            </div>
            <Skeleton className="size-4 shrink-0" rounded="sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
