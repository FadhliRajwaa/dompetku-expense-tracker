import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Kerangka halaman auth.
 *
 * Panel kiri adalah "jendela produk": angka, grafik, dan satu kutipan yang
 * memberi gambaran isi aplikasi sebelum orang mendaftar. Di layar kecil panel
 * itu hilang total — bukan diperkecil — karena form harus dapat seluruh
 * perhatian dan tidak boleh ada scroll horizontal.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_1fr]">
      {/* Panel brand — desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 p-12 lg:flex xl:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 mesh-brand" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(70% 60% at 20% 20%, #000 10%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(70% 60% at 20% 20%, #000 10%, transparent 100%)',
            }}
          />
        </div>

        <Link href="/" className="flex w-fit items-center gap-2.5">
          <img src="/logo.svg" alt="" className="size-9 rounded-xl shadow-sm" />
          <span className="text-[17px] font-extrabold tracking-tight">DompetKu</span>
        </Link>

        <div className="max-w-[430px]">
          <span className="eyebrow">Keuangan personal</span>
          <h2 className="text-display mt-4 text-[2.85rem] leading-[1.06]">
            Setiap rupiah
            <br />
            punya tempatnya.
          </h2>
          <p className="mt-5 text-[14.5px] leading-relaxed text-muted-foreground">
            Catat pengeluaran tanpa ribet, jaga saldo tiap dompet tetap akurat, dan lihat ke mana
            uangmu pergi — dalam satu dashboard yang tenang.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              { icon: ShieldCheck, text: 'Data terenkripsi & terpisah per akun' },
              { icon: Sparkles, text: 'Catat transaksi dalam hitungan detik' },
              { icon: TrendingUp, text: 'Peringatan anggaran sebelum habis' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.text} className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-brand-600 ring-1 ring-white/60 backdrop-blur dark:bg-card/60 dark:ring-border/60">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-[13.5px] font-medium text-foreground/85">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Kartu ringkasan contoh */}
        <div className="max-w-[430px] rounded-2xl border border-white/70 bg-white/75 p-4 shadow-xs backdrop-blur dark:border-border/70 dark:bg-card/70">
          <div className="flex items-center justify-between">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Contoh ringkasan bulanan
            </p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[9.5px] font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
              +26,4% menabung
            </span>
          </div>
          <p className="numeral mt-2 text-[1.55rem] leading-none">Rp 24.850.000</p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[72%] rounded-full bg-brand-500" />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted-foreground">
            <span>Target Rp 4.500.000</span>
            <span className="font-semibold text-foreground">Rp 5.688.000 tercapai</span>
          </div>
        </div>

        <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <ShieldCheck className="size-4 text-brand-500" aria-hidden="true" />
          Dilindungi enkripsi & terpisah per akun
        </p>
      </aside>

      {/* Panel form */}
      <main className="relative flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Beranda
          </Link>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <img src="/logo.svg" alt="" className="size-7 rounded-lg" />
            <span className="text-[15px] font-extrabold tracking-tight">DompetKu</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px] animate-rise">{children}</div>
        </div>
      </main>
    </div>
  );
}
