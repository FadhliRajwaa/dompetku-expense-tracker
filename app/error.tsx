'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <span className="material-symbols-outlined text-[24px]">warning</span>
      </span>
      <h1 className="text-display mt-5 text-[2rem] leading-tight">Ada yang tidak berjalan</h1>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
        Halaman ini gagal dimuat. Coba lagi — kalau masih berulang, muat ulang peramban.
      </p>
      <button
        onClick={reset}
        className="mt-7 inline-flex h-11 items-center gap-1.5 rounded-xl bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Coba lagi
      </button>
    </main>
  );
}
