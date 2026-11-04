'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="text-zinc-500">Coba muat ulang halaman ini.</p>
      <Button onClick={reset} className="bg-[#2FA084] hover:bg-[#27856d] text-white">Coba Lagi</Button>
    </main>
  );
}
