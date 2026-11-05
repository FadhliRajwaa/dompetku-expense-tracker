export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Memuat dashboard">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-44 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="h-[168px] animate-pulse rounded-2xl bg-foreground/10" />
        <div className="h-[168px] animate-pulse rounded-2xl bg-muted" />
        <div className="h-[168px] animate-pulse rounded-2xl bg-muted" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.62fr_1fr]">
        <div className="h-[320px] animate-pulse rounded-2xl bg-muted" />
        <div className="h-[320px] animate-pulse rounded-2xl bg-muted" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="h-[280px] animate-pulse rounded-2xl bg-muted" />
        <div className="h-[280px] animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
