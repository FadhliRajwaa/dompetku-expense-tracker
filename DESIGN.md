# DESIGN.md — Aplikasi Pencatatan Pengeluaran Keuangan Personal

> Status: v1.0 — Disetujui 4 Nov 2026 · Pasangan dari `PRD.md` · Primer hijau **#2FA084** (selaras desain Stitch, migrasi dari ungu selesai di `stitch_personal_finance_tracker_web_app/`)

## 1. Arsitektur

Monolit **Next.js 15 (App Router) + TypeScript** — frontend + API (Route Handlers) satu repo, satu deploy Vercel.

```
app/
  (marketing)/page.tsx            → landing (publik, SEO)
  (auth)/login/page.tsx           → login
  (auth)/register/page.tsx        → register
  (app)/layout.tsx                → shell app (sidebar/topbar/bottom-nav)
  (app)/dashboard/page.tsx        → Server Component, agregat via Prisma
  (app)/transaksi|dompet|anggaran|laporan|pengaturan/
  api/transactions|wallets|transfers|budgets|categories/route.ts
components/ui/*                   → shadcn/ui
components/charts/*               → Recharts (Client Components)
lib/{auth,db,validations,utils}.ts
prisma/schema.prisma
middleware.ts                     → proteksi Auth.js
```

- **Rendering:** Server Components default (dashboard, list dengan data agregat). Client Components hanya: chart, form, dialog, filter interaktif.
- **Auth:** Auth.js v5 credentials (email+password, bcrypt 12r). Middleware: `/dashboard/*` dkk wajib session; user login tidak bisa buka `/login`.
- **Validasi:** Zod schema dipakai di form (client) + Route Handler (server) — satu sumber `lib/validations.ts`.
- **DB:** PostgreSQL Aiven. `DATABASE_URL` = pooler (PgBouncer, `?pgbouncer=true`), `DIRECT_URL` = koneksi langsung untuk `prisma migrate`. `connection_limit=1..2` agar aman di serverless.

## 2. Skema Data (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  image        String?
  wallets      Wallet[]
  transactions Transaction[]
  transfers    Transfer[]
  budgets      Budget[]
  categories   Category[]
  createdAt    DateTime @default(now())
}

enum WalletType { CASH BANK E_WALLET }

model Wallet {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  type      WalletType
  balance   Decimal    @db.Decimal(19, 2) @default(0)
  icon      String     @default("wallet")
  isActive  Boolean    @default(true)
  createdAt DateTime   @default(now())
  @@index([userId])
}

enum CategoryType { INCOME EXPENSE }

model Category {
  id     String       @id @default(cuid())
  userId String?      // null = kategori global bawaan
  user   User?        @relation(fields: [userId], references: [id], onDelete: Cascade)
  name   String
  icon   String       @default("tag")
  color  String       @default("#2fa084")
  type   CategoryType
}

model Transaction {
  id         String        @id @default(cuid())
  userId     String
  user       User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  walletId   String
  categoryId String
  type       CategoryType
  amount     Decimal       @db.Decimal(19, 2)
  date       DateTime
  note       String?
  createdAt  DateTime      @default(now())
  @@index([userId, date(sort: Desc)])
  @@index([walletId])
  @@index([categoryId])
}

model Transfer {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fromWalletId String
  toWalletId   String
  amount       Decimal  @db.Decimal(19, 2)
  fee          Decimal? @db.Decimal(19, 2)
  date         DateTime
  note         String?
  createdAt    DateTime @default(now())
  @@index([userId, date(sort: Desc)])
}

model Budget {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId String
  month      Int      // 1..12
  year       Int
  limit      Decimal  @db.Decimal(19, 2)
  @@unique([userId, categoryId, month, year])
  @@index([userId, year, month])
}
```

**Aturan konsistensi saldo (wajib dalam Prisma interactive `$transaction`):**
- Tambah expense → `wallet.balance -= amount`; income → `+= amount`.
- Edit transaksi → kembalikan efek lama, terapkan efek baru (atau hitung delta).
- Hapus transaksi → kembalikan efeknya.
- Transfer → `from -= (amount + fee?)`, `to += amount`, + 1 record `Transfer`.

**Seed kategori global:** Expense — Makanan, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Pendidikan, Lainnya. Income — Gaji, Bonus, Usaha, Hadiah, Lainnya.

## 3. API (Route Handlers)

Semua di bawah `/api/*`, session-checked, Zod-validated, response JSON `{ data }` / `{ error }`:

| Method & Path | Fungsi |
|---|---|
| `GET/POST /api/wallets` | List + buat dompet |
| `PATCH/DELETE /api/wallets/[id]` | Edit / arsipkan |
| `GET/POST /api/transactions` | List (query: `from,to,categoryId,walletId,type,q,page,limit`) + buat |
| `PATCH/DELETE /api/transactions/[id]` | Edit / hapus (koreksi saldo) |
| `POST /api/transfers` (+ `GET`) | Transfer atomic + riwayat |
| `GET/POST /api/budgets?month=&year=` | List + buat |
| `PATCH/DELETE /api/budgets/[id]` | Edit / hapus |
| `GET/POST /api/categories` | List (global + milik user) + custom |
| `GET /api/dashboard?month=&year=` | Agregat sekali panggil: saldo, total in/out, arus 30 hari, per kategori, budget progress, recent 5 |
| `GET /api/reports/export?from=&to=&format=csv` | Export CSV |

## 4. Design System & Layout

- **Basis:** shadcn/ui + Tailwind. Font Inter/Geist. Light default (dark Fase 2).
- **Token warna:** background netral zinc; primary **`#2FA084`** (hijau; hover `#27856d`, tint `#d9f2e7`/`#c9eddd`, teks-di-atas-tint `#052e20`/`#1f6b4d`); income `emerald-500`, expense `rose-500`, warning `amber-500`; kategori pakai warna dari `Category.color`.
- **Bentuk:** radius 12–16px, border `zinc-200`, shadow lembut (`shadow-sm` kartu, `shadow-lg` dialog/FAB).
- **Desktop (≥1024px):** sidebar kiri 240px (logo, nav: Dashboard/Transaksi/Dompet/Anggaran/Laporan/Pengaturan, ringkasan saldo mini) + topbar (search global transaksi, tombol "＋ Catat", avatar menu) + konten max-w 1200px grid kartu.
- **Mobile (<768px):** header ringkas (greeting + saldo total) + konten 1 kolom; **bottom-nav 5 tab** (Dashboard, Transaksi, ＋, Dompet, Lainnya) + **FAB "＋"** buka sheet catat cepat (Sheet shadcn, tipe Income/Expense/Transfer bisa ganti tab); tabel → list kartu; form full-screen dialog; touch target ≥ 44px.
- **States:** skeleton loading per widget, empty-state ilustratif + CTA ("Belum ada transaksi — Catat pertama"), error boundary per segmen + halaman 404 custom.

## 5. Dashboard (detail widget)

1. **Stat cards (4):** Total Saldo (semua dompet aktif), Pemasukan bulan ini (+% vs bulan lalu), Pengeluaran bulan ini (+% vs bulan lalu), Sisa Budget (total limit − terpakai, merah bila negatif).
2. **Arus kas 30 hari:** area chart 2 seri (masuk/keluar), tooltip `Rp`.
3. **Pengeluaran per kategori:** donut + legenda % + klik legenda filter ke `/transaksi`.
4. **Budget bulan ini (top 5):** progress bar + badge status (Aman/Hampir habis/Melebihi) + link ke `/anggaran`.
5. **Transaksi terakhir (5):** ikon kategori, nama, dompet, ±Rp berwarna, tanggal relatif.
6. **Onboarding checklist** (user baru): buat dompet → catat transaksi → set budget. Hilang setelah selesai.

## 6. Keamanan & Validasi

- bcrypt 12 rounds; session httpOnly + `AUTH_SECRET`; middleware proteksi route.
- Zod: email valid, password ≥ 8 char (register/ubah), amount > 0 & ≤ 999M, tanggal tidak > hari ini + 1 th, transfer beda dompet + saldo cukup.
- Semua query Prisma ter-parameterisasi; tidak ada raw SQL dari input user.
- Ownership check: setiap query `where: { id, userId: session.user.id }` — user tidak bisa sentuh data user lain (tambahkan test untuk ini).

## 7. Testing & Kualitas

- **Unit (Vitest):** kalkulasi saldo (add/edit/delete/transfer), status budget (<80/80–100/>100), format IDR.
- **API (route-level test / manual):** ownership antar-user ditolak 403/404, validasi Zod gagal → 400.
- **E2E (Playwright, happy path):** register → buat dompet → catat expense → saldo berkurang → set budget → progress muncul.
- **Checklist mobile:** 360px & 390px — tidak ada overflow-x, FAB tidak menutupi CTA, bottom-nav tidak menutupi konten (padding-bottom).

## 8. Deploy & Env

- **Vercel:** root repo, framework preset Next.js, region Singapore. Env: `DATABASE_URL` (pooler Aiven + `?pgbouncer=true&connection_limit=1`), `DIRECT_URL` (direct Aiven), `AUTH_SECRET`, `AUTH_URL` (prod).
- **Aiven:** service PostgreSQL (via MCP Aiven, setelah spec approve) — pakai plan terkecil, region `sg` terdekat; aktifkan PgBouncer; simpan kredensial hanya di Vercel env + `.env.local` (git-ignored).
- **CI minimal:** `prisma validate` + `tsc --noEmit` + `next lint` + `next build` lolos sebelum merge.

## 9. Keputusan Desain (traceability)

| Keputusan | Alasan |
|---|---|
| Monolit Next.js, bukan frontend+backend pisah | 1 deploy Vercel, overkill dihindari untuk personal use |
| Prisma (bukan Drizzle) | Schema deklaratif + migration mapan, dev lebih cepat |
| Auth.js credentials, Google ditunda Fase 2 | Scope MVP kecil, tanpa dependensi OAuth |
| Saldo tersimpan + atomic update | Hindari agregat mahal tiap render; konsistensi via `$transaction` |
| Budget unik per (user, kategori, bulan, tahun) | Cegah duplikat; "salin bulan lalu" jadi mudah |
| Transfer = record + 2 mutasi saldo | Audit trail jelas, fee opsional |
| Recharts (bukan ECharts) | Cukup untuk MVP, ringan, React-native |
| IDR tunggal | Multi-currency Fase 3 |
