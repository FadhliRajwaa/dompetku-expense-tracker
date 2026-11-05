import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { LandingNav } from '@/components/landing/landing-nav';
import { Hero } from '@/components/landing/hero';
import { LandingSections } from '@/components/landing/landing-sections';
import { LandingFooter } from '@/components/landing/landing-footer';

export const metadata: Metadata = {
  title: 'DompetKu — Catat Pengeluaran, Kendalikan Budget',
  description:
    'Pencatatan keuangan personal yang tenang dan akurat. Kelola dompet, atur budget per kategori, target tabungan, dan lihat ke mana uangmu pergi. Gratis dan open source.',
};

export default async function LandingPage() {
  // Satu-satunya sumber kebenaran untuk CTA: sesi di server.
  // Tanpa ini, halaman publik akan selalu menampilkan "Masuk" walau pengguna
  // sudah login — persis keluhan yang harus diperbaiki.
  const session = await auth();
  const loggedIn = Boolean(session?.user);

  return (
    <div className="min-h-screen bg-background">
      <LandingNav loggedIn={loggedIn} />
      <main>
        <Hero loggedIn={loggedIn} />
        <LandingSections loggedIn={loggedIn} />
      </main>
      <LandingFooter loggedIn={loggedIn} />
    </div>
  );
}
