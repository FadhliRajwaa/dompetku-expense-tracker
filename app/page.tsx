import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DompetKu — Catat Pengeluaran, Kendalikan Budget',
  description:
    'Aplikasi pencatatan keuangan personal: kelola dompet, catat pemasukan & pengeluaran, atur budget bulanan, dan pantau lewat dashboard.',
};

const FEATURES = [
  {
    icon: 'bolt',
    title: 'Catat dalam 3 detik',
    desc: 'Satu ketukan dari halaman mana pun. Pemasukan, pengeluaran, atau transfer — tanpa pindah layar.',
    metric: '1 sheet, 3 tab',
  },
  {
    icon: 'account_balance_wallet',
    title: 'Semua dompet di satu tempat',
    desc: 'Tunai, rekening bank, dan e-wallet tampil berdampingan. Saldo terkoreksi otomatis tiap transaksi.',
    metric: 'Saldo atomik',
  },
  {
    icon: 'donut_small',
    title: 'Budget yang benar-benar dijaga',
    desc: 'Limit per kategori per bulan, dengan peringatan sebelum uangmu habis — bukan setelah.',
    metric: '3 tingkat status',
  },
  {
    icon: 'insights',
    title: 'Tahu ke mana uang pergi',
    desc: 'Arus kas 30 hari, komposisi kategori, dan rasio tabungan. Ekspor CSV kapan saja.',
    metric: 'CSV siap pakai',
  },
];

const STEPS = [
  { n: '01', title: 'Buat akun', desc: 'Nama, email, password — atau langsung lewat Google.', tag: '< 60 detik' },
  { n: '02', title: 'Daftarkan dompet', desc: 'Mulai dari satu dompet tunai dengan saldo hari ini.', tag: '1 dompet' },
  { n: '03', title: 'Catat & pantau', desc: 'Setiap transaksi memperbarui saldo, grafik, dan budget seketika.', tag: 'Otomatis' },
];

const FAQ = [
  {
    q: 'Apakah dataku aman?',
    a: 'Password di-hash dengan bcrypt, session disimpan di cookie httpOnly, dan setiap query difilter berdasarkan akunmu — kamu tidak bisa melihat data pengguna lain, begitu pula sebaliknya.',
  },
  {
    q: 'Bisa dipakai di HP?',
    a: 'Ya. Di layar kecil navigasi berubah jadi bottom bar dengan tombol catat cepat, dan tabel berubah menjadi kartu yang nyaman disentuh.',
  },
  {
    q: 'Apakah benar-benar gratis?',
    a: 'Seluruh fitur yang ada sekarang gratis untuk pemakaian personal, tanpa batas jumlah transaksi maupun dompet.',
  },
  {
    q: 'Bagaimana cara memindahkan saldo antar dompet?',
    a: 'Buka menu Dompet lalu pilih Transfer. Pilih dompet asal dan tujuan, isi nominal, dan kedua saldo terkoreksi dalam satu transaksi database.',
  },
];

const STATS = [
  { value: '0', unit: 'Rp', label: 'Biaya selamanya' },
  { value: '3', unit: 'detik', label: 'Catat satu transaksi' },
  { value: '∞', unit: '', label: 'Dompet & transaksi' },
  { value: '100', unit: '%', label: 'Data terpisah per akun' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ================= NAV ================= */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-[16px] font-extrabold tracking-tight">DompetKu</span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13.5px] font-semibold text-muted-foreground md:flex">
            <a href="#fitur" className="transition-colors hover:text-foreground">Fitur</a>
            <a href="#cara-kerja" className="transition-colors hover:text-foreground">Cara kerja</a>
            <a href="#harga" className="transition-colors hover:text-foreground">Harga</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-500 px-3.5 py-2 text-[13.5px] font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:translate-y-px"
            >
              Mulai gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="mesh-brand relative overflow-hidden border-b border-border/50">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 pb-14 pt-12 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:pb-20 lg:pt-16">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/70 px-3 py-1 text-[11.5px] font-bold text-brand-700 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              Gratis untuk pemakaian personal
            </span>

            <h1 className="text-display mt-5 text-[2.9rem] leading-[1.02] text-foreground sm:text-[3.6rem] lg:text-[4.15rem]">
              Uangmu punya cerita.
              <br />
              <em className="italic text-brand-600">Baca seluruhnya.</em>
            </h1>

            <p className="mt-5 max-w-[430px] text-[14.5px] leading-relaxed text-muted-foreground sm:text-[15.5px]">
              DompetKu mencatat setiap pemasukan dan pengeluaran, menjaga saldo tiap dompet tetap akurat, dan
              menunjukkan ke mana uangmu benar-benar pergi — sebelum bulan berakhir.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-[14.5px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/30 active:translate-y-px"
              >
                Mulai gratis sekarang
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-white/70 px-6 text-[14.5px] font-bold text-foreground backdrop-blur transition-colors hover:bg-white"
              >
                Saya sudah punya akun
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
              {['Tanpa kartu kredit', 'Tanpa batas transaksi', 'Login Google tersedia'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-brand-500">check_circle</span>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Panel dashboard */}
          <div className="animate-rise [animation-delay:100ms] lg:justify-self-end">
            <div className="relative w-full max-w-[440px] pb-16 lg:pb-10">
              <div className="absolute -inset-5 rounded-[36px] bg-brand-500/8 blur-2xl" />

              <div className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white p-5 shadow-[var(--shadow-lg)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Total saldo
                    </p>
                    <p className="numeral mt-1 text-[29px] leading-none">Rp 36.323.000</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <span className="material-symbols-outlined text-[19px]">account_balance_wallet</span>
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-brand-50/80 px-3 py-2.5">
                    <p className="text-[9.5px] font-bold uppercase tracking-wide text-brand-700/70">Masuk</p>
                    <p className="numeral mt-0.5 text-[14.5px] text-brand-800">+17.250.000</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 px-3 py-2.5">
                    <p className="text-[9.5px] font-bold uppercase tracking-wide text-rose-600/70">Keluar</p>
                    <p className="numeral mt-0.5 text-[14.5px] text-rose-700">-684.000</p>
                  </div>
                </div>

                {/* Donut komposisi */}
                <div className="mt-3 flex items-center gap-4 rounded-xl border border-border/60 p-3">
                  <svg viewBox="0 0 42 42" className="h-[74px] w-[74px] shrink-0 -rotate-90" aria-hidden="true">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EEF1F0" strokeWidth="5.5" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#2FA084" strokeWidth="5.5"
                      strokeDasharray="51 100" strokeLinecap="round" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E9A23B" strokeWidth="5.5"
                      strokeDasharray="27 100" strokeDashoffset="-51" strokeLinecap="round" />
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#5AA9C8" strokeWidth="5.5"
                      strokeDasharray="11 100" strokeDashoffset="-78" strokeLinecap="round" />
                  </svg>
                  <div className="min-w-0 flex-1 space-y-1">
                    {[
                      { c: '#2FA084', n: 'Tagihan', v: '51%' },
                      { c: '#E9A23B', n: 'Belanja', v: '27%' },
                      { c: '#5AA9C8', n: 'Hiburan', v: '11%' },
                    ].map((s) => (
                      <div key={s.n} className="flex items-center gap-1.5 text-[11px]">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} />
                        <span className="flex-1 truncate font-medium text-foreground/80">{s.n}</span>
                        <span className="font-semibold tabular text-muted-foreground">{s.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    { name: 'Gaji bulanan', wallet: 'BCA Tahapan', amount: '+Rp 14.500.000', inc: true },
                    { name: 'Makan siang', wallet: 'Dompet Tunai', amount: '-Rp 45.000', inc: false },
                  ].map((t) => (
                    <div key={t.name} className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          t.inc ? 'bg-brand-50 text-brand-600' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {t.inc ? 'south_west' : 'north_east'}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11.5px] font-semibold leading-tight">{t.name}</p>
                        <p className="truncate text-[9.5px] text-muted-foreground">{t.wallet}</p>
                      </div>
                      <span
                        className={`shrink-0 text-[11.5px] font-bold tabular ${
                          t.inc ? 'text-income' : 'text-foreground'
                        }`}
                      >
                        {t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kartu budget mengambang — ditempatkan di bawah-kiri kartu utama,
                  tidak menimpa daftar transaksi di dalamnya. */}
              <div className="absolute -bottom-14 -left-14 hidden w-[176px] rounded-2xl border border-border/60 bg-white p-3 shadow-[var(--shadow-lg)] sm:block">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Budget makan</p>
                  <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-700">Aman</span>
                </div>
                <p className="numeral mt-1.5 text-[15px]">Rp 1.240.000</p>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[48%] rounded-full bg-brand-500" />
                </div>
                <p className="mt-1 text-[9.5px] text-muted-foreground">48% dari Rp 2.500.000</p>
              </div>

              {/* Kartu "tanpa spreadsheet" — mengisi sisa ruang di kanan hero */}
              <div className="absolute -top-6 -right-8 hidden w-[196px] rounded-2xl border border-brand-200/60 bg-brand-50/95 p-3 shadow-[var(--shadow-lg)] backdrop-blur lg:block">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold leading-tight text-brand-900">
                      Tanpa spreadsheet
                    </p>
                    <p className="mt-0.5 text-[9.5px] leading-snug text-brand-800/70">
                      Saldo, budget, dan laporan terhubung otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Angka kunci */}
        <div className="border-t border-border/50 bg-white/40 backdrop-blur">
          <div className="mx-auto grid max-w-[1180px] grid-cols-2 divide-x divide-border/60 px-5 sm:px-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-1 py-5 first:pl-0 sm:px-6">
                <p className="numeral text-[1.5rem] leading-none text-foreground sm:text-[1.75rem]">
                  {/* Satuan selalu di belakang angka agar terbaca "3 detik", bukan "detik 3" */}
                  {s.unit === 'Rp' && <span className="mr-0.5 text-[0.72em] font-semibold">Rp</span>}
                  {s.value}
                  {s.unit && s.unit !== 'Rp' && (
                    <span className="ml-1 text-[0.55em] font-semibold text-muted-foreground">{s.unit}</span>
                  )}
                </p>
                <p className="mt-1.5 text-[11.5px] font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section id="fitur" className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="eyebrow">Yang kamu dapat</span>
            <h2 className="text-display mt-4 text-[2.1rem] leading-[1.1] text-foreground sm:text-[2.7rem]">
              Cukup rapi untuk dipercaya, cukup cepat untuk dipakai tiap hari.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Tidak ada menu tersembunyi, tidak ada angka yang perlu dihitung manual. Semua yang kamu catat
              langsung terhubung ke saldo, budget, dan laporan.
            </p>

            {/* Bukti mini: alur data */}
            <div className="mt-7 rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Satu transaksi, empat tempat
              </p>
              <div className="mt-3 space-y-2">
                {[
                  { icon: 'edit_note', t: 'Kamu catat', d: 'Rp 45.000 · Makan' },
                  { icon: 'account_balance_wallet', t: 'Saldo dompet', d: 'Terkoreksi seketika' },
                  { icon: 'donut_small', t: 'Budget kategori', d: 'Sisa ikut berkurang' },
                  { icon: 'insights', t: 'Grafik & laporan', d: 'Langsung diperbarui' },
                ].map((r, i, arr) => (
                  <div key={r.t} className="relative flex items-center gap-2.5">
                    {i < arr.length - 1 && (
                      <span className="absolute left-[13px] top-6 h-[18px] w-px bg-border" />
                    )}
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <span className="material-symbols-outlined text-[14px]">{r.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold leading-tight">{r.t}</p>
                      <p className="truncate text-[10.5px] text-muted-foreground">{r.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="group bg-card p-5 transition-colors hover:bg-muted/40 sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">{f.icon}</span>
                  </span>
                  <span className="font-mono text-[10.5px] font-medium text-muted-foreground/50">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-[14.5px] font-bold leading-snug">{f.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
                <span className="mt-3.5 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-bold text-muted-foreground">
                  <span className="material-symbols-outlined text-[12px] text-brand-500">check</span>
                  {f.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA ================= */}
      <section id="cara-kerja" className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Cara kerja</span>
              <h2 className="text-display mt-4 text-[2.1rem] leading-tight sm:text-[2.5rem]">
                Tiga langkah, lalu selesai.
              </h2>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Tidak ada setup rumit. Kamu bisa mencatat transaksi pertama dalam waktu kurang dari dua menit.
            </p>
          </div>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative bg-card p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-display text-[2.4rem] leading-none text-brand-200">{s.n}</span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {s.tag}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-bold">{s.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= HARGA ================= */}
      <section id="harga" className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <span className="eyebrow">Harga</span>
            <h2 className="text-display mt-4 text-[2.1rem] leading-[1.1] sm:text-[2.7rem]">Satu harga: gratis.</h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Seluruh fitur terbuka tanpa batas jumlah transaksi maupun dompet. Kalau nanti ada fitur lanjutan,
              yang sekarang tetap gratis.
            </p>

            <div className="mt-7 space-y-3">
              {[
                { icon: 'lock', t: 'Tanpa kartu kredit', d: 'Daftar langsung pakai.' },
                { icon: 'all_inclusive', t: 'Tanpa batas', d: 'Dompet & transaksi sepuasnya.' },
                { icon: 'download', t: 'Datamu milikmu', d: 'Ekspor CSV kapan saja.' },
              ].map((x) => (
                <div key={x.t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <span className="material-symbols-outlined text-[16px]">{x.icon}</span>
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">{x.t}</p>
                    <p className="text-[12.5px] text-muted-foreground">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Paket aktif */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl card-ink p-6 grain">
              <div
                className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
                style={{ background: 'var(--brand-400)' }}
              />
              <div className="relative flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">
                    Personal
                  </span>
                  <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[9.5px] font-bold text-white">
                    AKTIF
                  </span>
                </div>
                <p className="numeral mt-4 text-[2.6rem] leading-none">Rp 0</p>
                <p className="mt-1 text-[12px] text-white/45">selamanya, tanpa syarat</p>

                <ul className="mt-5 space-y-2.5 text-[12.5px]">
                  {[
                    'Dompet & transaksi tanpa batas',
                    'Budget bulanan per kategori',
                    'Grafik & laporan lengkap',
                    'Export CSV',
                    'Login email atau Google',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-white/85">
                      <span className="material-symbols-outlined mt-px text-[15px] text-brand-400">check</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-6 flex h-10 items-center justify-center rounded-xl bg-brand-500 text-[13px] font-bold text-white transition-colors hover:bg-brand-400"
                >
                  Buat akun gratis
                </Link>
              </div>
            </div>

            {/* Paket lanjutan */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Lanjutan
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[9.5px] font-bold text-muted-foreground">
                  SEGERA
                </span>
              </div>
              <p className="numeral mt-4 text-[2.6rem] leading-none text-foreground/25">Rp —</p>
              <p className="mt-1 text-[12px] text-muted-foreground">sedang dirancang</p>

              <ul className="mt-5 flex-1 space-y-2.5 text-[12.5px] text-muted-foreground">
                {['Export PDF rapi', 'Transaksi berulang otomatis', 'Target menabung', 'Mode gelap penuh'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="material-symbols-outlined mt-px text-[15px] text-muted-foreground/40">
                        remove
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-6 flex h-10 items-center justify-center rounded-xl border border-dashed border-border text-[12.5px] font-medium text-muted-foreground">
                Belum tersedia
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONI ================= */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Dipakai untuk apa</span>
              <h2 className="text-display mt-4 text-[2.1rem] leading-tight sm:text-[2.5rem]">
                Tiga kebiasaan yang berubah.
              </h2>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Bukan janji manis — ini yang paling sering diceritakan pengguna setelah dua minggu mencatat.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              {
                quote:
                  'Akhirnya tahu uang habis ke mana. Dulu cuma merasa "kok habis", sekarang kelihatan di grafik kategori.',
                name: 'Pekerja kantoran',
                tag: '2 bulan mencatat',
                icon: 'work',
              },
              {
                quote:
                  'Budget makan jadi lebih terkendali. Badge "hampir habis" muncul sebelum saya kebablasan, bukan setelah.',
                name: 'Mahasiswa',
                tag: 'Budget 6 kategori',
                icon: 'school',
              },
              {
                quote:
                  'Transfer antar dompet tanpa hitung manual. Saldo BCA dan dompet tunai selalu cocok dengan kenyataan.',
                name: 'Freelancer',
                tag: '4 dompet aktif',
                icon: 'laptop_mac',
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[22px] text-brand-300">format_quote</span>
                <blockquote className="mt-2 flex-1 text-[13px] leading-relaxed text-foreground/85">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-border/60 pt-3.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  </span>
                  <div>
                    <p className="text-[12px] font-bold leading-tight">{t.name}</p>
                    <p className="text-[10.5px] text-muted-foreground">{t.tag}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <span className="eyebrow">Pertanyaan</span>
              <h2 className="text-display mt-4 text-[2.1rem] leading-tight sm:text-[2.5rem]">
                Hal yang sering ditanya.
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                Belum terjawab? Semua yang kamu butuhkan ada di dalam aplikasi setelah mendaftar.
              </p>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {FAQ.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14.5px] font-bold marker:hidden">
                    {f.q}
                    <span className="material-symbols-outlined shrink-0 text-[19px] text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                      add
                    </span>
                  </summary>
                  <p className="pb-5 pr-8 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mesh-brand relative overflow-hidden rounded-[26px] border border-brand-200/60 px-6 py-12 sm:px-12 lg:py-16">
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-display max-w-lg text-[2.1rem] leading-[1.08] text-foreground sm:text-[2.8rem]">
                Mulai tahu ke mana uangmu pergi.
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                Daftar hari ini, catat transaksi pertamamu, dan lihat gambaran utuh keuanganmu bulan ini.
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-[14px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px"
                >
                  Buat akun gratis
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white/70 px-6 text-[14px] font-bold backdrop-blur transition-colors hover:bg-white"
                >
                  Sudah punya akun
                </Link>
              </div>
            </div>

            <div className="hidden justify-self-end lg:block">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Tanpa biaya tersembunyi
                </p>
                <p className="numeral mt-2 text-[2.4rem] leading-none text-brand-700">Rp 0</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">untuk selamanya</p>
                <div className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
                  {['Semua fitur terbuka', 'Tanpa batas transaksi', 'Ekspor kapan saja'].map((t) => (
                    <p key={t} className="flex items-center gap-1.5 text-[11.5px] font-medium">
                      <span className="material-symbols-outlined text-[14px] text-brand-500">check</span>
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border/60 bg-card">
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" />
                <span className="text-[15px] font-extrabold tracking-tight">DompetKu</span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
                Pencatatan keuangan personal yang tenang, akurat, dan gratis.
              </p>
            </div>

            <div className="flex gap-12 text-[12.5px]">
              <div>
                <p className="font-bold text-foreground">Produk</p>
                <ul className="mt-2.5 space-y-1.5 text-muted-foreground">
                  <li><a href="#fitur" className="transition-colors hover:text-foreground">Fitur</a></li>
                  <li><a href="#harga" className="transition-colors hover:text-foreground">Harga</a></li>
                  <li><a href="#faq" className="transition-colors hover:text-foreground">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="font-bold text-foreground">Akun</p>
                <ul className="mt-2.5 space-y-1.5 text-muted-foreground">
                  <li><Link href="/login" className="transition-colors hover:text-foreground">Masuk</Link></li>
                  <li><Link href="/register" className="transition-colors hover:text-foreground">Daftar</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-5 text-[11.5px] text-muted-foreground sm:flex-row">
            <span>© 2026 DompetKu. Seluruh hak cipta dilindungi.</span>
            <span>Dibuat dengan Next.js & PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
