# DompetKu — Pencatatan Keuangan Personal

Web app pencatatan pemasukan/pengeluaran personal: banyak dompet (Cash/Bank/E-Wallet) + transfer atomic, budget bulanan per kategori + peringatan, dashboard grafik, laporan + export CSV. Satu role: user.

**Stack:** Next.js 15 + TypeScript + Tailwind + shadcn/ui + Auth.js v5 + Prisma 6 + PostgreSQL (Aiven) + Recharts. Primer hijau `#2FA084`.

## Prasyarat

- Node.js ≥ 20, pnpm (`npm i -g pnpm`)
- Database PostgreSQL (repo ini memakai Aiven: service `postgresql-aiven`, database `expense_tracker`)

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env.local
# Isi .env.local:
# - DATABASE_URL / DIRECT_URL: Service URI dari Aiven Console
#   (service postgresql-aiven → Connection information → Reveal),
#   ganti /defaultdb menjadi /expense_tracker + ?sslmode=require
# - AUTH_SECRET: string acak ≥ 32 karakter
# - AUTH_URL: http://localhost:3000
pnpm exec prisma migrate dev   # butuh service Aiven RUNNING (plan free auto power-off bila idle!)
pnpm exec prisma db seed        # 13 kategori global
pnpm dev
```

Buka http://localhost:3000 → daftar → buat dompet pertama → catat transaksi.

## Test & kualitas

```bash
pnpm test                        # unit (Vitest): saldo, budget, transfer, CSV, format
pnpm exec tsc --noEmit           # typecheck
pnpm lint                        # eslint (0 error)
E2E_BASE_URL=http://localhost:3000 pnpm exec playwright test   # E2E (butuh dev server jalan)
pnpm build                       # build production
```

## Deploy ke Vercel

1. Push repo ini ke GitHub, import di Vercel (framework Next.js).
2. Isi Environment Variables (sama seperti `.env.local`, `AUTH_URL` = URL production):
   - `DATABASE_URL` = Service URI (ganti db → `expense_tracker`), tambah `&connection_limit=2`
   - `DIRECT_URL` = sama tanpa `connection_limit`
   - `AUTH_SECRET`, `AUTH_URL`
3. Deploy. Migrasi DB: jalankan `prisma migrate deploy` dari lokal dengan `DIRECT_URL` menunjuk Aiven.

> Catatan plan gratis Aiven: service **otomatis power-off saat idle** (dan limit 1 service/organisasi). Bila koneksi gagal tiba-tiba, nyalakan ulang dari Aiven Console → service `postgresql-aiven` → Power on.

## Keamanan (ringkas)

- Password bcrypt 12 rounds; session JWT httpOnly; email dinormalisasi (lowercase+trim); respons login disamakan (anti user-enumeration).
- Rate-limit: register 10x/10 mnt/IP, ganti password 5x/10 mnt/akun (in-memory per instance — best-effort di serverless; untuk proteksi serius pasang WAF/CDN di depan).
- Security headers (nosniff, DENY frame, referrer-policy) di `next.config.ts`.
- Semua query memakai `userId` session (ownership); validasi Zod di client + server; body JSON dibatasi 1MB; export CSV di-escape.

## Struktur

- `app/(marketing)` → landing; `app/(auth)` → login/register; `app/(app)` → dashboard, transaksi, dompet, anggaran, laporan, pengaturan
- `app/api` → Route Handlers (wallets, transactions, transfers, budgets, categories, dashboard, reports/export, account, auth)
- `lib` → db, auth, validations, dashboard (agregat), finance, format, csv, rate-limit
- `prisma` → schema + seed; `tests` → unit (Vitest) + e2e (Playwright)
