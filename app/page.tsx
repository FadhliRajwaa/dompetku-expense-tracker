import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'DompetKu — Catat Pengeluaran, Kendalikan Budget',
  description:
    'Aplikasi pencatatan keuangan personal: kelola dompet, catat pemasukan & pengeluaran, atur budget bulanan, dan pantau lewat dashboard.',
};

const FEATURES = [
  { title: 'Catat super cepat', desc: 'Pemasukan, pengeluaran, atau transfer antar dompet dalam hitungan detik — dari HP maupun laptop.' },
  { title: 'Banyak dompet', desc: 'Pisahkan Cash, rekening bank, dan e-wallet. Saldo selalu konsisten otomatis.' },
  { title: 'Budget + peringatan', desc: 'Set limit per kategori per bulan. Dapat badge Aman, Hampir habis, atau Melebihi.' },
  { title: 'Grafik & laporan', desc: 'Arus kas 30 hari, donut per kategori, tren bulanan, plus export CSV.' },
];

const STEPS = [
  { n: '1', title: 'Daftar gratis', desc: 'Cukup nama, email, dan password.' },
  { n: '2', title: 'Buat dompet pertama', desc: 'Misal Cash dengan saldo awal hari ini.' },
  { n: '3', title: 'Catat & pantau', desc: 'Set budget bulanan, lihat dashboard update otomatis.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafcfb] text-zinc-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo DompetKu" className="h-9 w-9" />
          <span className="font-bold text-lg">DompetKu</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Masuk</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-[#2FA084] hover:bg-[#27856d] text-white">Mulai Gratis</Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="py-12 text-center sm:py-20">
          <Badge className="mb-4 bg-[#d9f2e7] text-[#1f6b4d] hover:bg-[#d9f2e7]">100% gratis untuk personal</Badge>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Catat pengeluaran, kendalikan budget bulanan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-500">
            DompetKu membantu kamu tahu ke mana perginya uang setiap bulan — lewat dompet, kategori, dan budget yang jelas.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="bg-[#2FA084] hover:bg-[#27856d] text-white w-full sm:w-auto">
                Mulai Gratis Sekarang
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Saya sudah punya akun
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-500">{f.desc}</CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-bold">Cara kerja</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <Card key={s.n}>
                <CardHeader>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2FA084] text-lg font-bold text-white">{s.n}</span>
                  <CardTitle className="mt-2 text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-500">{s.desc}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Gratis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-500">
              <p className="text-3xl font-bold text-zinc-900">Rp 0</p>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Dompet & transaksi tanpa batas</li>
                <li>Budget bulanan + dashboard</li>
                <li>Export CSV</li>
              </ul>
              <Link href="/register" className="mt-4 block">
                <Button className="bg-[#2FA084] hover:bg-[#27856d] text-white w-full">Pilih Gratis</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-[#2FA084]">
            <CardHeader>
              <CardTitle>Premium <Badge className="ml-2 bg-[#d9f2e7] text-[#1f6b4d]">Segera hadir</Badge></CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-500">
              <p className="text-3xl font-bold text-zinc-900">Rp 0</p>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Semua fitur Gratis</li>
                <li>Export PDF + transaksi berulang</li>
                <li>Prioritas fitur baru</li>
              </ul>
              <Link href="/register" className="mt-4 block">
                <Button variant="outline" className="w-full">Mulai dari Gratis</Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16">
          <h2 className="text-center text-2xl font-bold">Sering ditanyakan</h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            <details className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Apakah dataku aman?</summary>
              <p className="mt-2 text-sm text-zinc-500">Password di-hash (bcrypt), session aman, dan setiap user hanya bisa akses datanya sendiri.</p>
            </details>
            <details className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Bisa dipakai di HP?</summary>
              <p className="mt-2 text-sm text-zinc-500">Bisa. Tampilan menyesuaikan layar HP dengan navigasi bawah dan tombol catat cepat.</p>
            </details>
            <details className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Apakah benar-benar gratis?</summary>
              <p className="mt-2 text-sm text-zinc-500">Ya, semua fitur MVP gratis untuk pemakaian personal.</p>
            </details>
            <details className="rounded-xl border bg-white p-4">
              <summary className="cursor-pointer font-medium">Bagaimana cara pindah dompet (transfer)?</summary>
              <p className="mt-2 text-sm text-zinc-500">Lewat menu Dompet → Transfer. Saldo kedua dompet terkoreksi otomatis dan tercatat sebagai riwayat.</p>
            </details>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row">
          <span>© 2026 DompetKu — catat keuangan personal</span>
          <span>Dibuat dengan Next.js + PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}
