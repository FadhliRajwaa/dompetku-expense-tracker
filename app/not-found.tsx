import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-zinc-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Link href="/">
        <Button className="bg-[#2FA084] hover:bg-[#27856d] text-white">Kembali ke Beranda</Button>
      </Link>
    </main>
  );
}
