import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Panel brand — desktop saja */}
      <aside className="mesh-brand relative hidden flex-col justify-between overflow-hidden border-r border-border/60 p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" className="h-9 w-9 rounded-xl shadow-sm" />
          <span className="text-[17px] font-extrabold tracking-tight">DompetKu</span>
        </Link>

        <div className="max-w-[420px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
            Keuangan personal
          </p>
          <h2 className="text-display mt-4 text-[2.9rem] leading-[1.08] text-foreground">
            Setiap rupiah
            <br />
            punya tempatnya.
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted-foreground">
            Catat pengeluaran tanpa ribet, jaga saldo tiap dompet tetap akurat, dan lihat ke mana uangmu pergi —
            dalam satu dashboard yang tenang.
          </p>

          <div className="mt-10 space-y-3.5">
            {[
              { icon: 'shield', text: 'Data terenkripsi & terpisah per akun' },
              { icon: 'bolt', text: 'Catat transaksi dalam hitungan detik' },
              { icon: 'donut_small', text: 'Peringatan budget sebelum habis' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-brand-600 backdrop-blur">
                  <span className="material-symbols-outlined text-[17px]">{f.icon}</span>
                </span>
                <span className="text-[13.5px] font-medium text-foreground/80">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kartu ringkasan — memberi gambaran produk sebelum daftar */}
        <div className="max-w-[420px] rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Contoh ringkasan bulanan
            </p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9.5px] font-bold text-brand-700">
              +26,4% menabung
            </span>
          </div>
          <p className="numeral mt-2 text-[1.55rem] leading-none text-foreground">Rp 24.850.000</p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[72%] rounded-full bg-brand-500" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground">
            <span>Target Rp 4.500.000</span>
            <span className="font-semibold text-foreground">Rp 5.688.000 tercapai</span>
          </div>
        </div>

        <blockquote className="max-w-[420px] border-l-2 border-brand-400 pl-3 text-[12.5px] italic leading-relaxed text-foreground/70">
          &ldquo;DompetKu membantu saya menghemat lebih dari 25% pengeluaran bulanan sejak bulan
          pertama.&rdquo;
          <footer className="mt-1.5 flex items-center gap-2 not-italic">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
              BS
            </span>
            <span className="text-[11px] font-semibold text-foreground/70">
              Pengguna DompetKu · Jakarta
            </span>
          </footer>
        </blockquote>

        <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
          <span className="material-symbols-outlined text-[16px] text-brand-500">verified_user</span>
          Dilindungi enkripsi & terpisah per akun
        </div>
      </aside>

      {/* Panel form */}
      <main className="flex min-h-screen flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        {/* Logo mobile */}
        <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
          <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-[16px] font-extrabold tracking-tight">DompetKu</span>
        </Link>
        <div className="mx-auto w-full max-w-[400px] animate-rise">{children}</div>
      </main>
    </div>
  );
}
