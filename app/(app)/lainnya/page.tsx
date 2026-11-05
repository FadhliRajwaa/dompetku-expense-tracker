import Link from 'next/link';

const LINKS = [
  { href: '/anggaran', label: 'Anggaran', icon: 'donut_small', desc: 'Batas pengeluaran per kategori' },
  { href: '/laporan', label: 'Laporan', icon: 'insights', desc: 'Tren bulanan dan export CSV' },
  { href: '/pengaturan', label: 'Pengaturan', icon: 'settings', desc: 'Profil, kata sandi, dan kategori' },
];

export default function LainnyaPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">Navigasi</p>
        <h1 className="text-display mt-1 text-[2rem] leading-tight">Lainnya</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Halaman yang tidak ada di navigasi bawah</p>
      </div>

      <div className="flex flex-col gap-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
              <span className="material-symbols-outlined text-[20px]">{l.icon}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{l.label}</p>
              <p className="truncate text-[12px] text-muted-foreground">{l.desc}</p>
            </div>
            <span className="material-symbols-outlined text-[19px] text-muted-foreground/70 transition-transform group-hover:translate-x-0.5">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
