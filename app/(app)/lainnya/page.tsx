import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const LINKS = [
  { href: '/anggaran', label: 'Anggaran', icon: 'pie_chart', desc: 'Budget bulanan per kategori' },
  { href: '/laporan', label: 'Laporan', icon: 'insights', desc: 'Tren & export CSV' },
  { href: '/pengaturan', label: 'Pengaturan', icon: 'settings', desc: 'Profil, kategori, akun' },
];

export default function LainnyaPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-bold">Lainnya</h1>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href}>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <span className="material-symbols-outlined text-[#2FA084]">{l.icon}</span>
              <div>
                <p className="font-medium">{l.label}</p>
                <p className="text-sm text-zinc-500">{l.desc}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
