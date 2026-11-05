import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mesh-brand flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <img src="/logo.svg" alt="" className="h-11 w-11 rounded-xl shadow-sm" />
      <p className="mt-8 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">
        Error 404
      </p>
      <h1 className="text-display mt-3 text-[2.6rem] leading-tight sm:text-5xl">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
        Alamat yang kamu buka tidak ada, atau sudah dipindahkan. Mari kembali ke tempat yang berguna.
      </p>
      <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
        >
          Ke dashboard
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-5 text-[14px] font-semibold transition-colors hover:bg-muted"
        >
          Beranda
        </Link>
      </div>
    </main>
  );
}
