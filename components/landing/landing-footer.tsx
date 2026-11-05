import Link from 'next/link';
import { ArrowUpRight, GitBranch } from 'lucide-react';

const PRODUK = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara kerja' },
  { href: '#tanya', label: 'Tanya jawab' },
];

const AKUN = [
  { href: '/login', label: 'Masuk' },
  { href: '/register', label: 'Daftar' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function LandingFooter({ loggedIn }: { loggedIn: boolean }) {
  const akun = loggedIn ? AKUN.filter((a) => a.href === '/dashboard') : AKUN.slice(0, 2);

  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="" className="size-7 rounded-md" />
              <span className="text-[15px] font-extrabold tracking-tight">DompetKu</span>
            </div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
              Pencatatan keuangan personal yang tenang, akurat, dan gratis. Dibangun dengan Next.js
              dan PostgreSQL.
            </p>
            <a
              href="https://github.com/FadhliRajwaa/dompetku-expense-tracker"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:border-brand-300 hover:text-foreground"
            >
              <GitBranch className="size-3.5" aria-hidden="true" />
              Lihat kode sumber
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </a>
          </div>

          <div className="flex gap-12 text-[12.5px]">
            <div>
              <p className="font-bold text-foreground">Produk</p>
              <ul className="mt-2.5 space-y-1.5 text-muted-foreground">
                {PRODUK.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="transition-colors hover:text-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground">Akun</p>
              <ul className="mt-2.5 space-y-1.5 text-muted-foreground">
                {akun.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-5 text-[11.5px] text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} DompetKu. Sumber terbuka.</span>
          <span>Tidak ada iklan. Tidak ada pelacakan.</span>
        </div>
      </div>
    </footer>
  );
}
