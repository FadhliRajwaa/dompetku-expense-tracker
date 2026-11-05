'use client';

import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Check,
  CloudOff,
  Download,
  Lock,
  Moon,
  PiggyBank,
  Plus,
  Repeat,
  Users,
  Wallet,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Plus,
    title: 'Catat dalam tiga detik',
    desc: 'Satu lembar catat dari halaman mana pun. Pemasukan, pengeluaran, atau transfer tanpa berpindah layar.',
  },
  {
    icon: Wallet,
    title: 'Semua dompet di satu tempat',
    desc: 'Tunai, rekening bank, dan e-wallet tampil berdampingan. Saldo terkoreksi otomatis tiap transaksi.',
  },
  {
    icon: BarChart3,
    title: 'Anggaran yang benar-benar dijaga',
    desc: 'Batas per kategori per bulan, dengan peringatan sebelum uangmu habis — bukan sesudahnya.',
  },
  {
    icon: PiggyBank,
    title: 'Target tabungan',
    desc: 'Sisihkan dana untuk tujuan tertentu. Setoran dan penarikan hanya mengalokasikan, tidak mengubah saldo dompet.',
  },
  {
    icon: Repeat,
    title: 'Transaksi berulang',
    desc: 'Gaji, sewa, langganan. Catat sekali, jalankan otomatis tiap bulan dengan penguncian akhir bulan.',
  },
  {
    icon: Users,
    title: 'Rumah tangga',
    desc: 'Bagikan dompet tertentu dengan pasangan atau keluarga tanpa membuka seluruh catatanmu.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Buat akun',
    desc: 'Nama, email, kata sandi — atau langsung lewat Google. Kurang dari satu menit.',
  },
  {
    n: '02',
    title: 'Daftarkan dompet',
    desc: 'Mulai dari satu dompet tunai dan isi saldo hari ini. Rekening lain menyusul kapan saja.',
  },
  {
    n: '03',
    title: 'Catat & pantau',
    desc: 'Setiap transaksi memperbarui saldo, grafik, dan anggaran seketika. Tanpa hitung manual.',
  },
];

const FAQ = [
  {
    q: 'Apakah dataku aman?',
    a: 'Kata sandi di-hash dengan bcrypt, sesi disimpan di cookie httpOnly, dan setiap query difilter berdasarkan akunmu. Kamu tidak bisa melihat data pengguna lain, begitu pula sebaliknya.',
  },
  {
    q: 'Bisa dipakai di HP?',
    a: 'Ya. Di layar kecil navigasi berubah menjadi bar bawah dengan tombol catat cepat, tabel berubah jadi kartu, dan aplikasi bisa dipasang ke layar utama (PWA).',
  },
  {
    q: 'Apakah benar-benar gratis?',
    a: 'Seluruh fitur terbuka tanpa biaya, tanpa batas jumlah transaksi maupun dompet. Proyek ini open source — tidak ada paket berbayar yang disembunyikan.',
  },
  {
    q: 'Bisa ekspor dataku?',
    a: 'Kapan saja: CSV untuk diolah di spreadsheet, atau PDF rapi untuk arsip bulanan. Datamu tidak dikunci di dalam aplikasi.',
  },
  {
    q: 'Bagaimana memindahkan saldo antar dompet?',
    a: 'Buka menu Dompet lalu pilih Transfer. Pilih dompet asal dan tujuan, isi nominal, dan kedua saldo terkoreksi dalam satu transaksi database.',
  },
];

const STATS = [
  { value: '3', unit: 'detik', label: 'Catat satu transaksi' },
  { value: '∞', unit: '', label: 'Dompet & transaksi' },
  { value: '0', unit: 'Rp', label: 'Biaya, selamanya' },
  { value: '100', unit: '%', label: 'Data terpisah per akun' },
];

function SectionHead({
  eyebrow,
  title,
  desc,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-xl text-center' : 'max-w-xl'}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="text-display mt-4 text-[2.05rem] leading-[1.1] sm:text-[2.6rem]">{title}</h2>
      {desc && <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

export function LandingSections({
  loggedIn,
  figure,
}: {
  loggedIn: boolean;
  figure: React.ReactNode;
}) {
  return (
    <>
      {/* ============ ANGKATAN ANGKA ============ */}
      <Reveal
        as="section"
        className="border-y border-border/60 bg-card/60"
        stagger={0}
      >
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 divide-x divide-border/60 px-5 sm:px-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="reveal-item px-1 py-6 first:pl-0 sm:px-7">
              <p className="numeral text-[1.55rem] leading-none sm:text-[1.85rem]">
                {s.unit === 'Rp' && <span className="mr-0.5 text-[0.72em] font-semibold">Rp</span>}
                {s.value}
                {s.unit && s.unit !== 'Rp' && (
                  <span className="ml-1 text-[0.52em] font-semibold text-muted-foreground">
                    {s.unit}
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-[11.5px] font-medium text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ============ FITUR ============ */}
      <section id="fitur" className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              eyebrow="Yang kamu dapat"
              title={
                <>
                  Cukup rapi untuk dipercaya,
                  <br className="hidden sm:block" /> cukup cepat untuk dipakai tiap hari.
                </>
              }
            />
            <p className="max-w-[280px] text-[13px] leading-relaxed text-muted-foreground">
              Tidak ada menu tersembunyi, tidak ada angka yang perlu dihitung manual. Semua yang
              kamu catat langsung terhubung.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            // Properti transisi ditulis eksplisit, BUKAN `transition-all`:
            // GSAP menganimasikan `transform` + `opacity` kartu ini saat masuk
            // layar, dan `transition-all` ikut men-transisikan tiap nilai yang
            // GSAP tulis — animasi diperebutkan dua mesin (terukur 4-8 frame
            // panjang per scroll). `translate` (yang dipakai hover) tetap
            // halus, `transform` milik GSAP bebas.
            return (
              <article
                key={f.title}
                className="reveal-item group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-[translate,background-color,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-brand-300/70 hover:shadow-md"
              >
                {/* Sorot halus saat hover: memberi umpan balik tanpa menggeser layout.
                    Gradien + opacity, bukan blur + warna: filter blur di enam
                    kartu ini diraster ulang saat kartu masuk layar (~30-100 ms
                    per frame). Opacity cukup di-composite. */}
                <div className="glow-400 pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon className="size-[19px]" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10.5px] font-medium text-muted-foreground/45">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="relative mt-4 text-[14.5px] font-bold leading-snug">{f.title}</h3>
                <p className="relative mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </article>
            );
          })}
        </Reveal>
      </section>

      {/* ============ ALUR DATA ============ */}
      <section className="border-y border-border/60 bg-muted/25">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <Reveal>
            <SectionHead
              eyebrow="Satu transaksi, empat tempat"
              title="Catat sekali. Sisanya mengikuti."
              desc="Tidak ada salinan data yang bisa berbeda. Saldo, anggaran, dan laporan membaca catatan yang sama, jadi tidak mungkin ada dua angka yang saling bertentangan."
            />
            <ul className="mt-6 space-y-3">
              {[
                { icon: Plus, t: 'Kamu catat', d: 'Rp 45.000 · Makan siang' },
                { icon: Wallet, t: 'Saldo dompet', d: 'Terkoreksi seketika' },
                { icon: BarChart3, t: 'Anggaran kategori', d: 'Sisa ikut berkurang' },
                { icon: CalendarClock, t: 'Grafik & laporan', d: 'Langsung diperbarui' },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <li key={r.t} className="flex items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-brand-600 shadow-xs ring-1 ring-border/70">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold leading-tight">{r.t}</p>
                      <p className="truncate text-[12px] text-muted-foreground">{r.d}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Mesin alur uang — ilustrasi isometrik yang benar-benar bergerak:
              koin turun, drum berputar, jarum dial mencatat total.
              Dikirim sebagai prop dari server supaya geometri tidak ikut ke
              bundle klien; hanya komponen live-nya yang berjalan di browser. */}
          {/* Sengaja TANPA Reveal. Menganimasikan opasitas atau posisi pada
              pembungkus ilustrasi isometrik memaksa browser me-raster ulang
              seluruh subtree SVG setiap frame dan sempat memicu hitch ~117 ms
              tepat saat kartu masuk layar. Ilustrasi besar tampil statis. */}
          {figure}
        </div>
      </section>

      {/* ============ CARA KERJA ============ */}
      <section id="cara-kerja" className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Cara kerja" title="Tiga langkah, lalu selesai." />
            <p className="max-w-[290px] text-[13px] leading-relaxed text-muted-foreground">
              Tidak ada penyiapan rumit. Transaksi pertama bisa tercatat dalam waktu kurang dari dua
              menit.
            </p>
          </div>
        </Reveal>

        <Reveal as="ol" className="mt-10 grid gap-3 sm:grid-cols-3" stagger={0.1}>
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="reveal-item relative rounded-2xl border border-border/70 bg-card p-6 shadow-xs"
            >
              <span className="text-display text-[2.6rem] leading-none text-brand-200 dark:text-brand-800">
                {s.n}
              </span>
              <h3 className="mt-5 text-[15px] font-bold">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* ============ PRIVASI ============ */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="Privasi & kendali"
              title="Datamu milikmu. Selalu."
              desc="Tidak ada iklan, tidak ada penjualan data, tidak ada langganan yang mengunci fitur. Kamu bisa membawa pergi semuanya kapan pun."
            />
          </Reveal>

          <Reveal className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
            {[
              { icon: Lock, t: 'Terpisah per akun', d: 'Setiap query difilter userId di server.' },
              { icon: Download, t: 'Ekspor bebas', d: 'CSV dan PDF tanpa batas.' },
              { icon: Moon, t: 'Mode gelap', d: 'Nyaman dipakai malam hari.' },
              { icon: CloudOff, t: 'PWA offline-ready', d: 'Aset di-cache, data selalu segar.' },
            ].map((x) => {
              const Icon = x.icon;
              return (
                <div
                  key={x.t}
                  className="reveal-item rounded-2xl border border-border/70 bg-background/60 p-4"
                >
                  <Icon className="size-[18px] text-brand-600 dark:text-brand-300" aria-hidden="true" />
                  <p className="mt-2.5 text-[13px] font-bold">{x.t}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{x.d}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="tanya" className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHead
              eyebrow="Pertanyaan"
              title="Hal yang sering ditanya."
              desc="Belum terjawab? Setelah mendaftar, semua panduan singkat ada di dalam aplikasi."
            />
          </Reveal>

          <Reveal className="divide-y divide-border border-y border-border" stagger={0.05}>
            {FAQ.map((f) => (
              <details key={f.q} className="reveal-item group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[14.5px] font-bold marker:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="material-symbols-outlined shrink-0 text-[19px] text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  >
                    add
                  </span>
                </summary>
                <p className="pb-5 pr-8 text-[13px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ CTA AKHIR ============ */}
      <section className="mx-auto max-w-[1200px] px-5 pb-16 sm:px-8 lg:pb-24">
        <Reveal>
          <div className="mesh-brand relative overflow-hidden rounded-[28px] border border-brand-200/60 px-6 py-14 sm:px-12 lg:py-16">
            <div aria-hidden="true" className="glow-400 absolute -right-16 -top-16 size-64 rounded-full" />
            <div className="relative max-w-lg">
              <h2 className="text-display text-[2.05rem] leading-[1.08] sm:text-[2.8rem]">
                {loggedIn ? 'Lanjutkan dari tempat kamu berhenti.' : 'Mulai tahu ke mana uangmu pergi.'}
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                {loggedIn
                  ? 'Dashboard-mu sudah menunggu dengan saldo dan anggaran terbaru.'
                  : 'Daftar hari ini, catat transaksi pertamamu, dan lihat gambaran utuh keuanganmu bulan ini.'}
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href={loggedIn ? '/dashboard' : '/register'}
                  className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-[14px] font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600 active:translate-y-px"
                >
                  {loggedIn ? 'Buka dashboard' : 'Buat akun gratis'}
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  href={loggedIn ? '/laporan' : '/login'}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white/70 px-6 text-[14px] font-bold backdrop-blur transition-colors hover:bg-white dark:bg-card/70 dark:hover:bg-card"
                >
                  {loggedIn ? 'Lihat laporan' : 'Sudah punya akun'}
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <Check className="size-3.5 text-brand-500" aria-hidden="true" />
                Gratis selamanya · tanpa kartu kredit · data bisa diekspor
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
