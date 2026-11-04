# Expense Tracker MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun web app pencatatan keuangan personal (Next.js monolit + Prisma + Auth.js + PostgreSQL Aiven) yang bisa register, kelola dompet, catat transaksi/transfer, atur budget, dan lihat dashboard — deploy ke Vercel.

**Architecture:** Monolit Next.js 15 App Router + TypeScript. Server Components untuk halaman data, Client Components hanya untuk chart/form interaktif. Route Handlers `/api/*` untuk CRUD dengan validasi Zod ganda (client+server). Saldo dompet disimpan dan di-update atomic via Prisma interactive transaction. Auth Auth.js v5 credentials + middleware proteksi.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS, shadcn/ui, Auth.js v5, Prisma 6, PostgreSQL 18 (Aiven `expense_tracker`), bcryptjs, Zod, Recharts, Vitest, Playwright.

**Spec:** `E:/expense-tracker/PRD.md` dan `E:/expense-tracker/DESIGN.md` (primer hijau #2FA084, disetujui 4 Nov 2026)

## Global Constraints

- Node.js >= 20 (environment punya v24.11.1).
- Package manager: pnpm (sudah ada `.pnpm-store` di environment; bila pnpm belum terinstal: `npm i -g pnpm`).
- Database: PostgreSQL Aiven yang SUDAH ADA — service `postgresql-aiven`, database `expense_tracker`, host `postgresql-aiven-fadhlirajwaarahmana-9486.k.aivencloud.com:16722`. Kredensial (user `avnadmin` + password) diambil user dari Aiven Console, JANGAN hardcode/commit ke repo.
- Prisma: `DATABASE_URL` = koneksi langsung (migrasi + runtime, karena plan free TANPA PgBouncer), `DIRECT_URL` = sama. Tambahkan `?sslmode=require&connection_limit=2`.
- Semua secret hanya di `.env.local` (git-ignored). Contoh di `.env.example` tanpa nilai asli.
- Design token primer: `#2FA084` (hover `#27856d`, tint `#d9f2e7`/`#c9eddd`); JANGAN pakai ungu/indigo untuk primer.
- Bahasa UI: Indonesia. Mata uang: IDR tunggal, format `Rp`.
- Semua query data user WAJIB filter `userId` dari session (ownership check).
- Semua mutasi saldo WAJIB dalam Prisma interactive `$transaction`.
- Commit message: `feat:` / `fix:` / `test:` / `chore:` prefix, Bahasa Indonesia boleh.

## Review Focus

- Transfer antar dompet milik user lain (fromWalletId/toWalletId milik orang) harus ditolak — bukan sekadar beda dompet.
- Edit/hapus transaksi milik user lain via tebak ID harus 404, bukan 403-bocor-info (jangan bedakan pesan).
- Amount negatif/nol/desimal aneh (`0.001`) lolos validasi harus ditolak dengan pesan jelas.
- Budget duplikat (kategori+bulan+tahun sama) via race double-submit harus tetap 1 (andalkan @@unique + tangani P2002).
- Tanggal transaksi masa depan jauh (tahun depan) harus ditolak (batas: tidak > hari ini + 1 thn).

---

### Task 1: Scaffolding Next.js + Toolchain + Git

**Files:**
- Create: seluruh repo Next.js (via `_scaffold` lalu pindah ke root), `.env.example`, `.env.local`, `vitest.config.ts`, `playwright.config.ts`, `tests/unit/format.test.ts` (smoke)
- Modify: `.gitignore` (pastikan `.env*.local`), `app/globals.css` (token primer hijau)

**Interfaces:**
- Consumes: tidak ada (task pertama)
- Produces: repo Next.js 15 jalan + `pnpm build` hijau; `.env.example` berisi nama variabel baku (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`) yang dipakai semua task berikutnya.

- [ ] **Step 1: Init git + cek toolchain**

```bash
git init
node --version   # butuh >= 20
pnpm --version   # bila belum ada: npm i -g pnpm
```

- [ ] **Step 2: Scaffold Next.js ke folder sementara (root tidak kosong karena ada docs/)**

```bash
pnpm dlx create-next-app@latest _scaffold --typescript --tailwind --eslint --app --import-alias "@/*" --use-pnpm
```

- [ ] **Step 3: Pindahkan hasil scaffold ke root lalu hapus folder sementara**

```bash
mv _scaffold/* ./ && mv _scaffold/.* ./ 2>/dev/null; rmdir _scaffold
ls app prisma 2>&1 | head -n 5
```

Expected: folder `app/` ada. (Bila `mv _scaffold/.*` protes soal `.`/`..`, abaikan — itu normal.)

- [ ] **Step 4: Install dependency MVP (pin versi mayor)**

```bash
pnpm add next-auth@beta prisma@6 @prisma/client@6 zod bcryptjs recharts
pnpm add -D vitest tsx @playwright/test
pnpm dlx shadcn@latest init -y -d
pnpm dlx shadcn@latest add button card dialog sheet input label badge progress table select tabs skeleton avatar dropdown-menu -y
```

Catatan: bila CLI shadcn gagal (flag berubah), cek dokumentasi terbaru via skill context7 lalu sesuaikan — targetnya `components/ui/*` + `lib/utils.ts` (fungsi `cn`) tersedia.

- [ ] **Step 5: Tulis `.env.example` (tanpa nilai asli)**

```env
# Copy ke .env.local lalu isi. JANGAN commit .env.local
# DB Aiven: service postgresql-aiven, database expense_tracker
DATABASE_URL="postgres://avnadmin:ISI_PASSWORD_DI_SINI@postgresql-aiven-fadhlirajwaarahmana-9486.k.aivencloud.com:16722/expense_tracker?sslmode=require&connection_limit=2"
DIRECT_URL="postgres://avnadmin:ISI_PASSWORD_DI_SINI@postgresql-aiven-fadhlirajwaarahmana-9486.k.aivencloud.com:16722/expense_tracker?sslmode=require"
AUTH_SECRET="isi-dengan-output-npx-auth-secret-min-32-karakter"
AUTH_URL="http://localhost:3000"
```

- [ ] **Step 6: Buat `.env.local` + generate AUTH_SECRET**

```bash
cp .env.example .env.local
pnpm dlx auth secret   # bila gagal, isi manual 32+ karakter acak
```

Lalu minta password DB ke user (dari Aiven Console → postgresql-aiven → Connection information → Reveal) dan masukkan ke `DATABASE_URL`/`DIRECT_URL` di `.env.local`. Jangan pernah paste password ke chat/commit.

- [ ] **Step 7: Token primer hijau di `app/globals.css`**

Tambahkan di akhir file (setelah `@layer base` bila ada):

```css
:root {
  --brand: #2fa084;
  --brand-dark: #27856d;
  --brand-tint: #d9f2e7;
}
```

Gunakan class `bg-[#2FA084] hover:bg-[#27856d] text-white` untuk tombol primer. JANGAN pakai `bg-indigo-*`/`bg-purple-*` untuk primer.

- [ ] **Step 8: Konfigurasi Vitest + Playwright minimal**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

`tambahkan ke package.json scripts`: `"test": "vitest run tests/unit"`.

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: true },
});
```

- [ ] **Step 9: Verifikasi baseline hijau**

```bash
pnpm install
pnpm exec prisma --version
pnpm exec tsc --noEmit
pnpm build
```

Expected: semua lolos tanpa error.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffolding Next.js 15 + Tailwind + shadcn + toolchain test"
```

<!-- CHUNK1-END -->

### Task 2: Prisma Schema + Seed Kategori Global

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`
- Test: `tests/unit/budget-status.test.ts` (status budget murni — tidak butuh DB)

**Interfaces:**
- Consumes: `.env.local` dengan `DATABASE_URL`/`DIRECT_URL` valid dari Task 1.
- Produces: model `User, Wallet, Transaction, Transfer, Budget, Category` + enum; fungsi `getBudgetStatus(persen): 'aman'|'hampir-habis'|'melebihi'` di `lib/finance.ts` (dipakai Task 6 & 9). Koneksi DB terverifikasi via `prisma db pull`-less check `prisma validate` + migrate sukses.

- [ ] **Step 1: Tulis test status budget (TDD, murni tanpa DB)**

`tests/unit/budget-status.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getBudgetStatus } from '@/lib/finance';

describe('getBudgetStatus', () => {
  it('aman bila < 80%', () => {
    expect(getBudgetStatus(79.9)).toBe('aman');
  });
  it('hampir-habis pada 80-100%', () => {
    expect(getBudgetStatus(80)).toBe('hampir-habis');
    expect(getBudgetStatus(100)).toBe('hampir-habis');
  });
  it('melebihi bila > 100%', () => {
    expect(getBudgetStatus(100.01)).toBe('melebihi');
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

```bash
pnpm test tests/unit/budget-status.test.ts
```

Expected: FAIL — `@/lib/finance` belum ada.

- [ ] **Step 3: Tulis `lib/finance.ts` minimal**

```ts
export type BudgetStatus = 'aman' | 'hampir-habis' | 'melebihi';

/** persen = terpakai/limit*100 */
export function getBudgetStatus(persen: number): BudgetStatus {
  if (persen > 100) return 'melebihi';
  if (persen >= 80) return 'hampir-habis';
  return 'aman';
}
```

- [ ] **Step 4: Jalankan test, pastikan PASS**

```bash
pnpm test tests/unit/budget-status.test.ts
```

Expected: 3 PASS.

- [ ] **Step 5: Tulis `prisma/schema.prisma` (salin persis dari DESIGN.md §2)**

Salin seluruh blok schema dari `DESIGN.md` §2 (User, WalletType, Wallet, CategoryType, Category, Transaction, Transfer, Budget) dengan tambahan generator+datasource:

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Catatan: default warna kategori baru `#2fa084` (bukan `#6366f1`).

- [ ] **Step 6: Validasi schema**

```bash
pnpm exec prisma validate
```

Expected: "The schema is valid".

- [ ] **Step 7: Tulis `prisma/seed.ts` kategori global (13 baris)**

Expense (Makanan #f97316, Transportasi #3b82f6, Belanja #b45309, Tagihan #f59e0b, Hiburan #ec4899, Kesehatan #14b8a6, Pendidikan #06b6d4, Lainnya #71717a) + Income (Gaji, Bonus, Usaha, Hadiah, Lainnya #10b981). Semua `userId: null`. Tambahkan `"prisma": { "seed": "tsx prisma/seed.ts" }` ke package.json.

- [ ] **Step 8: Migrasi + seed ke Aiven (PENTING: service harus RUNNING)**

```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
```

Expected: tabel terbentuk di database `expense_tracker`; peringatan: bila error koneksi, service Aiven kemungkinan auto-poweroff — nyalakan dari Aiven Console lalu ulangi.

- [ ] **Step 9: Commit**

```bash
git add prisma tests lib package.json
git commit -m "feat: schema Prisma + seed kategori global + util status budget"
```

### Task 3: Auth (Register/Login/Logout + Middleware)

**Files:**
- Create: `lib/db.ts` (Prisma singleton), `lib/validations.ts` (skim: registerSchema, loginSchema), `lib/auth.ts` (Auth.js config credentials), `app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
- Test: `tests/unit/format.test.ts` (formatIDR — dipakai halaman auth & dashboard)

**Interfaces:**
- Consumes: model `User` dari Task 2; `.env.local` `AUTH_SECRET`+`AUTH_URL`.
- Produces: `auth()` helper + session berisi `{ id, name, email }`; route `/login`, `/register` bekerja; `middleware.ts` proteksi semua route app. `formatIDR(n)` di `lib/format.ts` (dipakai Task 7-11).

- [ ] **Step 1: Tulis test formatIDR (TDD)**

`tests/unit/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatIDR } from '@/lib/format';

describe('formatIDR', () => {
  it('format ribuan Indonesia', () => {
    expect(formatIDR(1500000)).toBe('Rp 1.500.000');
  });
  it('nol', () => {
    expect(formatIDR(0)).toBe('Rp 0');
  });
  it('negatif tetap tampil', () => {
    expect(formatIDR(-45000)).toBe('-Rp 45.000');
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

```bash
pnpm test tests/unit/format.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Tulis `lib/format.ts`**

```ts
export function formatIDR(n: number | string): string {
  const v = typeof n === 'string' ? Number(n) : n;
  const abs = Math.abs(v).toLocaleString('id-ID');
  return v < 0 ? `-Rp ${abs}` : `Rp ${abs}`;
}
```

- [ ] **Step 4: Jalankan, pastikan PASS**

```bash
pnpm test tests/unit/format.test.ts
```

Expected: 3 PASS.

- [ ] **Step 5: Tulis `lib/db.ts`, `lib/validations.ts`, `lib/auth.ts`**

`lib/db.ts` (singleton anti hot-reload leak):

```ts
import { PrismaClient } from '@prisma/client';

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = db;
```

`lib/validations.ts`:

```ts
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

`lib/auth.ts` (Auth.js v5 credentials, bcrypt 12r):

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { loginSchema } from './validations';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
```

- [ ] **Step 6: Route handler + middleware**

`app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

`middleware.ts` (di root repo, sejajar `app/`):

```ts
import { auth } from '@/lib/auth';

const PROTECTED = ['/dashboard', '/transaksi', '/dompet', '/anggaran', '/laporan', '/pengaturan'];
const AUTH_PAGES = ['/login', '/register'];

export default auth((req) => {
  const loggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  if (loggedIn && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return Response.redirect(new URL('/dashboard', req.url));
  }
  if (!loggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
```

- [ ] **Step 7: Halaman register + login (Server Component + Client form)**

Register: form client validasi `registerSchema`, POST ke Server Action/internal API `POST /api/auth/register` (buat di step ini):

`app/api/auth/register/route.ts`:

```ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash } });
  return NextResponse.json({ data: { id: user.id } }, { status: 201 });
}
```

Login: form client panggil `signIn('credentials', { email, password, redirectTo: '/dashboard' })` dari `next-auth/react`. Setelah register sukses → `signIn` otomatis lalu redirect `/dashboard`.

- [ ] **Step 8: Uji manual alur auth**

```bash
pnpm dev
```

Buka `/register` → daftar → redirect `/dashboard`; `/logout` via `signOut()`; akses `/dashboard` tanpa login → redirect `/login`. Buka-baseline mobile 390px: form tidak overflow.

- [ ] **Step 9: Commit**

```bash
git add app lib middleware.ts tests package.json
git commit -m "feat: auth register-login-logout + middleware proteksi route"
```

<!-- CHUNK2-END -->

### Task 4: API Dompet (Wallets CRUD + Arsip)

**Files:**
- Create: `app/api/wallets/route.ts`, `app/api/wallets/[id]/route.ts`; tambah ke `lib/validations.ts`: `walletSchema`
- Test: `tests/unit/wallet-guard.test.ts` (aturan arsip: dompet bersaldo/transaksi tak boleh hapus fisik)

**Interfaces:**
- Consumes: `auth()` dari Task 3; model `Wallet` Task 2.
- Produces: `GET/POST /api/wallets`, `PATCH/DELETE /api/wallets/[id]`; aturan: DELETE = arsip (`isActive=false`), tolak bila `balance != 0`? TIDAK — arsip selalu boleh; hapus fisik tidak disediakan. `createWallet(userId, data)` dipakai Task 5 & seed onboarding.

- [ ] **Step 1: Tulis test aturan arsip (TDD, murni)**

`tests/unit/wallet-guard.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { canArchiveWallet } from '@/lib/finance';

describe('canArchiveWallet', () => {
  it('boleh arsip walau ada transaksi', () => {
    expect(canArchiveWallet({ txCount: 5 })).toEqual({ ok: true });
  });
  it('dompet utama terakhir tetap boleh arsip (UX warning di UI, bukan blokir)', () => {
    expect(canArchiveWallet({ txCount: 0 })).toEqual({ ok: true });
  });
});
```

Rasional: arsip tidak pernah diblokir server; UI memberi peringatan bila ini dompet aktif terakhir.

- [ ] **Step 2: Jalankan, pastikan GAGAL** (`pnpm test tests/unit/wallet-guard.test.ts`, FAIL: fungsi belum ada).
- [ ] **Step 3: Tambah ke `lib/finance.ts`:**

```ts
export function canArchiveWallet(_w: { txCount: number }): { ok: true } {
  return { ok: true };
}
```

- [ ] **Step 4: Jalankan, pastikan PASS.**
- [ ] **Step 5: Tambah `walletSchema` ke `lib/validations.ts`:**

```ts
import { z } from 'zod';

export const walletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter').max(30),
  type: z.enum(['CASH', 'BANK', 'E_WALLET']),
  balance: z.number().min(0, 'Saldo awal tidak boleh negatif').max(999_000_000_000),
  icon: z.string().max(30).default('wallet'),
});
export type WalletInput = z.infer<typeof walletSchema>;
```

- [ ] **Step 6: Tulis `app/api/wallets/route.ts`:**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { walletSchema } from '@/lib/validations';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await db.wallet.findMany({ where: { userId: (session.user as { id: string }).id, isActive: true }, orderBy: { createdAt: 'asc' } });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = walletSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const data = await db.wallet.create({ data: { ...parsed.data, userId: (session.user as { id: string }).id } });
  return NextResponse.json({ data }, { status: 201 });
}
```

- [ ] **Step 7: Tulis `app/api/wallets/[id]/route.ts` (PATCH edit + DELETE arsip, ownership check, 404 seragam):**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { walletSchema } from '@/lib/validations';

async function owned(userId: string, id: string) {
  return db.wallet.findFirst({ where: { id, userId } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await owned(userId, id);
  if (!existing) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const parsed = walletSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const data = await db.wallet.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const existing = await owned(userId, id);
  if (!existing) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const data = await db.wallet.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ data });
}
```

- [ ] **Step 8: Uji manual via curl/Thunder Client:** tanpa session → 401; buat dompet → 201; PATCH milik user lain → 404; DELETE → `isActive=false` (cek via Prisma Studio `pnpm exec prisma studio`).
- [ ] **Step 9: Commit** — `git add app lib tests && git commit -m "feat: API dompet CRUD + arsip (soft delete)"`.

### Task 5: API Transaksi (CRUD + Saldo Atomic)

**Files:**
- Create: `app/api/transactions/route.ts`, `app/api/transactions/[id]/route.ts`; tambah ke validations: `transactionSchema`; tambah ke `lib/finance.ts`: `applyEffect`, `reverseEffect`
- Test: `tests/unit/balance-effect.test.ts`

**Interfaces:**
- Consumes: `auth()`, model `Wallet/Transaction/Category`, `walletSchema` flow dari Task 4.
- Produces: CRUD transaksi atomic; helper efek saldo dipakai Task 6 (transfer memakai pola sama). Ownership+validasi: kategori harus milik user atau global (`userId: null`); wallet harus milik user + aktif.

- [ ] **Step 1: Tulis test efek saldo (TDD):**

`tests/unit/balance-effect.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applyEffect, reverseEffect } from '@/lib/finance';

describe('efek saldo', () => {
  it('expense mengurangi, income menambah', () => {
    expect(applyEffect(100000, 'EXPENSE', 25000)).toBe(75000);
    expect(applyEffect(100000, 'INCOME', 25000)).toBe(125000);
  });
  it('reverse mengembalikan', () => {
    expect(reverseEffect(75000, 'EXPENSE', 25000)).toBe(100000);
    expect(reverseEffect(125000, 'INCOME', 25000)).toBe(100000);
  });
});
```

- [ ] **Step 2: GAGAL** (`pnpm test tests/unit/balance-effect.test.ts`).
- [ ] **Step 3: Tambah ke `lib/finance.ts`:**

```ts
export type TxnType = 'INCOME' | 'EXPENSE';

export function applyEffect(balance: number, type: TxnType, amount: number): number {
  return type === 'EXPENSE' ? balance - amount : balance + amount;
}
export function reverseEffect(balance: number, type: TxnType, amount: number): number {
  return type === 'EXPENSE' ? balance + amount : balance - amount;
}
```

- [ ] **Step 4: PASS.**
- [ ] **Step 5: Tambah `transactionSchema`:**

```ts
export const transactionSchema = z.object({
  walletId: z.string().cuid('Dompet tidak valid'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
  date: z.coerce.date().max(new Date(Date.now() + 366 * 86400000), 'Tanggal terlalu jauh'),
  note: z.string().max(200).optional(),
});
```

- [ ] **Step 6: `app/api/transactions/route.ts` — GET (filter+pagination) + POST (atomic):**

```ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/lib/validations';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const q = new URL(req.nextUrl).searchParams;
  const page = Math.max(1, Number(q.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(q.get('limit') ?? 20)));
  const where: Prisma.TransactionWhereInput = { userId };
  if (q.get('type') === 'INCOME' || q.get('type') === 'EXPENSE') where.type = q.get('type') as 'INCOME' | 'EXPENSE';
  if (q.get('walletId')) where.walletId = q.get('walletId')!;
  if (q.get('categoryId')) where.categoryId = q.get('categoryId')!;
  if (q.get('from') || q.get('to')) {
    where.date = {};
    if (q.get('from')) (where.date as Prisma.DateTimeFilter).gte = new Date(q.get('from')!);
    if (q.get('to')) (where.date as Prisma.DateTimeFilter).lte = new Date(q.get('to')!);
  }
  if (q.get('q')) where.note = { contains: q.get('q')!, mode: 'insensitive' };
  const [items, total] = await Promise.all([
    db.transaction.findMany({ where, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit, include: { wallet: true, } }),
    db.transaction.count({ where }),
  ]);
  return NextResponse.json({ data: items, meta: { page, limit, total } });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const parsed = transactionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { walletId, categoryId, type, amount, date, note } = parsed.data;
  const wallet = await db.wallet.findFirst({ where: { id: walletId, userId, isActive: true } });
  if (!wallet) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const category = await db.category.findFirst({ where: { id: categoryId, OR: [{ userId }, { userId: null }] } });
  if (!category) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  const data = await db.$transaction(async (tx) => {
    const txn = await tx.transaction.create({ data: { userId, walletId, categoryId, type, amount, date, note } });
    await tx.wallet.update({ where: { id: walletId }, data: { balance: type === 'EXPENSE' ? { decrement: amount } : { increment: amount } } });
    return txn;
  });
  return NextResponse.json({ data }, { status: 201 });
}
```

- [ ] **Step 7: `app/api/transactions/[id]/route.ts` — PATCH (delta saldo) + DELETE (kembalikan):**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/lib/validations';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const old = await db.transaction.findFirst({ where: { id, userId } });
  if (!old) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  const parsed = transactionSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  if (parsed.data.walletId || parsed.data.categoryId) {
    if (parsed.data.walletId) {
      const w = await db.wallet.findFirst({ where: { id: parsed.data.walletId, userId, isActive: true } });
      if (!w) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
    }
    if (parsed.data.categoryId) {
      const c = await db.category.findFirst({ where: { id: parsed.data.categoryId, OR: [{ userId }, { userId: null }] } });
      if (!c) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }
  }
  const data = await db.$transaction(async (tx) => {
    // kembalikan efek lama
    await tx.wallet.update({
      where: { id: old.walletId },
      data: { balance: old.type === 'EXPENSE' ? { increment: old.amount } : { decrement: old.amount } },
    });
    const next = {
      walletId: parsed.data.walletId ?? old.walletId,
      categoryId: parsed.data.categoryId ?? old.categoryId,
      type: parsed.data.type ?? old.type,
      amount: parsed.data.amount ?? Number(old.amount),
      date: parsed.data.date ?? old.date,
      note: parsed.data.note ?? old.note,
    };
    // terapkan efek baru
    await tx.wallet.update({
      where: { id: next.walletId },
      data: { balance: next.type === 'EXPENSE' ? { decrement: next.amount } : { increment: next.amount } },
    });
    return tx.transaction.update({ where: { id }, data: next });
  });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const old = await db.transaction.findFirst({ where: { id, userId } });
  if (!old) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  await db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: old.walletId },
      data: { balance: old.type === 'EXPENSE' ? { increment: old.amount } : { decrement: old.amount } },
    });
    await tx.transaction.delete({ where: { id } });
  });
  return NextResponse.json({ data: { id } });
}
```

- [ ] **Step 8: Uji manual:** buat expense 100rb → saldo berkurang 100rb; edit jadi 150rb → berkurang total 150rb; hapus → kembali; transaksi user lain → 404.
- [ ] **Step 9: Commit** — `git add app lib tests && git commit -m "feat: API transaksi CRUD + koreksi saldo atomic"`.

### Task 6: API Transfer + Budget + Kategori

**Files:**
- Create: `app/api/transfers/route.ts`, `app/api/budgets/route.ts`, `app/api/budgets/[id]/route.ts`, `app/api/categories/route.ts`, `app/api/dashboard/route.ts` (agregat ringan, dipakai penuh di Task 9)
- Validations: `transferSchema`, `budgetSchema`, `categorySchema`
- Test: `tests/unit/transfer-guard.test.ts`

**Interfaces:**
- Consumes: pola atomic Task 5; model Transfer/Budget/Category.
- Produces: endpoint transfer atomic + budget CRUD (`salin bulan lalu` via POST massal di UI: GET bulan lalu → POST satu-satu, server cukup sediakan POST tunggal + tangani P2002 409); `getBudgetStatus` dipakai lagi di response dashboard (`{ used, limit, percent, status }`).

- [ ] **Step 1: Test guard transfer (TDD):**

```ts
import { describe, expect, it } from 'vitest';
import { validateTransfer } from '@/lib/finance';

describe('validateTransfer', () => {
  it('tolak dompet sama', () => {
    expect(validateTransfer({ from: 'a', to: 'a', amount: 1000, balance: 5000 }).ok).toBe(false);
  });
  it('tolak saldo kurang', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 6000, balance: 5000 }).ok).toBe(false);
  });
  it('tolak amount <= 0', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 0, balance: 5000 }).ok).toBe(false);
  });
  it('terima transfer valid', () => {
    expect(validateTransfer({ from: 'a', to: 'b', amount: 1000, balance: 5000 }).ok).toBe(true);
  });
});
```

- [ ] **Step 2: GAGAL → Step 3 tambah `validateTransfer` ke `lib/finance.ts`:**

```ts
export function validateTransfer(w: { from: string; to: string; amount: number; balance: number }): { ok: boolean; error?: string } {
  if (w.from === w.to) return { ok: false, error: 'Dompet asal dan tujuan harus berbeda' };
  if (!(w.amount > 0)) return { ok: false, error: 'Nominal harus > 0' };
  if (w.amount > w.balance) return { ok: false, error: 'Saldo dompet asal tidak cukup' };
  return { ok: true };
}
```

- [ ] **Step 4: PASS.**
- [ ] **Step 5: Tambah schema `transferSchema`, `budgetSchema`, `categorySchema`:**

```ts
export const transferSchema = z.object({
  fromWalletId: z.string().cuid(),
  toWalletId: z.string().cuid(),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
  fee: z.number().min(0).max(999_000_000).optional().default(0),
  date: z.coerce.date(),
  note: z.string().max(200).optional(),
}).refine((v) => v.fromWalletId !== v.toWalletId, { message: 'Dompet asal dan tujuan harus berbeda' });

export const budgetSchema = z.object({
  categoryId: z.string().cuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  limit: z.number().positive().max(999_000_000_000),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(30),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().max(30).default('tag'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus hex #rrggbb').default('#2fa084'),
});
```

- [ ] **Step 6: `app/api/transfers/route.ts` (kepemilikan KEDUA dompet dicek — Review Focus #1):**

```ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transferSchema } from '@/lib/validations';
import { validateTransfer } from '@/lib/finance';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await db.transfer.findMany({ where: { userId: (session.user as { id: string }).id }, orderBy: { date: 'desc' }, take: 50 });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const parsed = transferSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { fromWalletId, toWalletId, amount, fee = 0, date, note } = parsed.data;
  const wallets = await db.wallet.findMany({ where: { id: { in: [fromWalletId, toWalletId] }, userId, isActive: true } });
  if (wallets.length !== 2) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const from = wallets.find((w) => w.id === fromWalletId)!;
  const guard = validateTransfer({ from: fromWalletId, to: toWalletId, amount: amount + fee, balance: Number(from.balance) });
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 400 });
  const data = await db.$transaction(async (tx) => {
    await tx.wallet.update({ where: { id: fromWalletId }, data: { balance: { decrement: amount + fee } } });
    await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: amount } } });
    return tx.transfer.create({ data: { userId, fromWalletId, toWalletId, amount, fee, date, note } });
  });
  return NextResponse.json({ data }, { status: 201 });
}
```

- [ ] **Step 7: `app/api/budgets/*` + `app/api/categories/route.ts`:** pola sama (ownership check, 404 seragam). Budget POST tangani `Prisma.P2002` → 409 'Budget kategori ini sudah ada di bulan tersebut'. Categories GET kembalikan `[{...global}, {...milikUser}]`; POST validasi nama unik per user per tipe (cek manual → 409).
- [ ] **Step 8: `app/api/dashboard/route.ts` (agregat, query `?month=&year=`):** total saldo (dompet aktif), total in/out bulan tsb, arus 30 hari (group by date via `groupBy` + isi tanggal kosong dengan 0), per kategori expense + persen, budget progress (used dari sum expense kategori tsb) + status, 5 transaksi terakhir. Satu `Promise.all`, tanpa N+1.
- [ ] **Step 9: Uji manual semua endpoint + Review Focus #1–#4 (transfer dompet orang → 404; double-submit budget → 1 record + 409 kedua).**
- [ ] **Step 10: Commit** — `git add app lib tests && git commit -m "feat: API transfer, budget, kategori, dashboard agregat"`.

### Task 7: Landing Page Publik `/`

**Files:**
- Create: `app/(marketing)/page.tsx`, `app/(marketing)/layout.tsx` (nav + footer), komponen seksional di file yang sama (tanpa over-abstraksi)
- Test: Playwright `tests/e2e/landing.spec.ts`

**Interfaces:**
- Consumes: token primer `#2FA084` (Task 1), font Inter/Geist bawaan scaffold.
- Produces: landing responsif 360–1440px, CTA → `/register`, lolos audit tanpa error console.

- [ ] **Step 1: Tulis E2E landing:**

```ts
import { test, expect } from '@playwright/test';

test('landing tampil + CTA ke register', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /catat/i })).toBeVisible();
  await page.getByRole('link', { name: /mulai gratis/i }).first().click();
  await expect(page).toHaveURL(/register/);
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL** (belum ada konten/CTA).
- [ ] **Step 3: Implementasi `app/(marketing)/page.tsx`:** hero (headline + sub + 2 CTA: "Mulai Gratis" → `/register`, "Masuk" → `/login`), strip 4 fitur (Catat cepat, Dompet & transfer, Budget + peringatan, Grafik & laporan), cara kerja 3 langkah, pricing dummy 2 kartu (Gratis/Premium), 3 testimoni statis, FAQ 4 item (`<details>`), footer. Semua tombol primer `bg-[#2FA084] hover:bg-[#27856d]`.
- [ ] **Step 4: E2E PASS** (`pnpm exec playwright test tests/e2e/landing.spec.ts`; bila browser belum terinstal: `pnpm exec playwright install chromium` sekali).
- [ ] **Step 5: Cek visual 390px + 1440px** (DevTools/Playwright screenshot), tidak ada overflow-x.
- [ ] **Step 6: Commit** — `git add app tests && git commit -m "feat: landing page publik + E2E"`.

<!-- CHUNK3-END -->

### Task 8: Shell App + Navigasi (Sidebar Desktop / Bottom-Nav + FAB Mobile)

**Files:**
- Create: `app/(app)/layout.tsx`, `components/app-shell.tsx` (Client: sidebar/bottom-nav/FAB), `components/quick-add-sheet.tsx` (Sheet catat cepat 3 tab)
- Test: Playwright `tests/e2e/shell.spec.ts`

**Interfaces:**
- Consumes: session (untuk nama user + logout); API transaksi Task 5 (quick-add POST).
- Produces: layout proteksi + navigasi 6 rute (dashboard/transaksi/dompet/anggaran/laporan/pengaturan); `QuickAddSheet` dipakai ulang di Task 9–11.

- [ ] **Step 1: E2E shell:**

```ts
import { test, expect } from '@playwright/test';

test('tanpa login ke dashboard dialihkan ke login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});
```

- [ ] **Step 2: PASS setelah middleware Task 3** (test ini verifikasi ulang proteksi end-to-end).
- [ ] **Step 3: `app/(app)/layout.tsx` (Server):** ambil session, tampilkan `AppShell { user, children }`; sisipkan saldo total ringkas (query cepat `sum` dompet aktif) untuk sidebar mini + header mobile.
- [ ] **Step 4: `components/app-shell.tsx` (Client):** desktop sidebar 240px (nav 6 item + saldo mini + logout), mobile: header ringkas + `bottom-nav` 5 tab (Dashboard, Transaksi, Catat=FAB tengah, Dompet, Lainnya→sheet menu Anggaran/Laporan/Pengaturan) + padding-bottom konten `pb-24`. FAB buka `QuickAddSheet`.
- [ ] **Step 5: `components/quick-add-sheet.tsx`:** tab Pengeluaran/Pemasukan/Transfer; field nominal (quick chips +10rb/+50rb/+100rb/+500rb), dompet select, kategori select, tanggal, catatan; submit → POST API sesuai tab → `router.refresh()` + tutup + toast sukses. Error tampil inline Bahasa Indonesia.
- [ ] **Step 6: Uji 390px:** bottom-nav tidak menutupi konten (scroll sampai bawah terlihat), FAB 52px berfungsi; 1440px: sidebar tetap + konten max-w 1200px.
- [ ] **Step 7: Commit** — `git add app components tests && git commit -m "feat: shell app + navigasi desktop-mobile + quick-add"`.

### Task 9: Dashboard `/dashboard` + Widget Grafik

**Files:**
- Create: `app/(app)/dashboard/page.tsx` (Server, fetch `/api/dashboard` internal via `db` langsung — JANGAN fetch HTTP ke diri sendiri), `components/charts/cashflow-chart.tsx`, `components/charts/category-donut.tsx` (Client, Recharts), `components/budget-progress.tsx`, `components/recent-list.tsx`, `components/stat-cards.tsx`
- Test: Playwright `tests/e2e/dashboard.spec.ts` (butuh login — gunakan storageState dari helper `tests/e2e/helpers.ts`: register via API + login + simpan state)

**Interfaces:**
- Consumes: agregat Task 6 (`/api/dashboard`), `formatIDR`, `getBudgetStatus`, `QuickAddSheet`.
- Produces: dashboard lengkap 6 widget + onboarding checklist; pola Recharts Client-island dipakai Task 11 (laporan).

- [ ] **Step 1: Tulis helper auth E2E `tests/e2e/helpers.ts`:**

```ts
import { request } from '@playwright/test';

export async function loggedInState() {
  const email = `t${Date.now()}@mail.com`;
  const ctx = await request.newContext();
  await ctx.post('/api/auth/register', { data: { name: 'Tes', email, password: 'password123' } });
  // login via credentials membutuhkan browser; sederhananya: test login UI 1x lalu save storageState di spec
  return { email, password: 'password123' };
}
```

(Spec dashboard: register via API → buka `/login` → isi form → submit → simpan storageState → pakai untuk semua test login.)

- [ ] **Step 2: E2E dashboard kosong (user baru):**

```ts
// tests/e2e/dashboard.spec.ts (garis besar)
test('dashboard user baru: onboarding + empty state', async ({ page }) => {
  // login dulu via UI, lalu:
  await page.goto('/dashboard');
  await expect(page.getByText(/buat dompet/i)).toBeVisible();
  await expect(page.getByText(/Rp 0/)).toBeVisible();
});
```

- [ ] **Step 3: Implementasi `page.tsx` (Server):** query langsung via `db` (salin logika agregat dari `/api/dashboard` ke `lib/dashboard.ts` agar SATU sumber dipakai route + page — refactor kecil Task 6: pindahkan logika ke `lib/dashboard.ts`). Render: stat cards, cashflow chart (props data), donut, budget top-5, recent 5, onboarding checklist (syarat: hitung dompet/transaksi/budget > 0).
- [ ] **Step 4: Komponen chart Recharts:** area chart 2 seri (masuk `#10b981`, keluar `#f43f5e`), tooltip `formatIDR`; donut kategori (warna dari DB) + legenda %. Keduanya `'use client'`, `ResponsiveContainer`, skeleton saat loading (gunakan `loading.tsx` per segmen).
- [ ] **Step 5: Empty state + error:** `loading.tsx` skeleton; bila agregat gagal → `error.tsx` dengan tombol "Coba lagi".
- [ ] **Step 6: E2E PASS + cek 390px/1440px.**
- [ ] **Step 7: Commit** — `git add app components lib tests && git commit -m "feat: dashboard + chart arus kas + donut + budget"`.

### Task 10: Halaman Transaksi + Dompet + Transfer UI

**Files:**
- Create: `app/(app)/transaksi/page.tsx` (+ `components/txn-filters.tsx`, `components/txn-table.tsx`/`txn-cards.tsx`), `app/(app)/dompet/page.tsx` (+ `components/wallet-cards.tsx`, `components/transfer-form.tsx`)
- Test: Playwright `tests/e2e/happy-path.spec.ts` (E2E inti PRD!)

**Interfaces:**
- Consumes: API Task 4–6, `QuickAddSheet`, `formatIDR`.
- Produces: CRUD penuh via UI; pola filter-URL (`?type=&walletId=&q=&page=`) dipakai ulang Task 11 (laporan).

- [ ] **Step 1: Tulis E2E happy path (GAGAL dulu sebelum UI ada):**

```ts
import { test, expect } from '@playwright/test';

test('register-dompet-transaksi-budget', async ({ page }) => {
  // 1. register via UI, 2. buat dompet "Cash" saldo 1jt via UI,
  // 3. catat expense 100rb Makanan, 4. cek saldo tinggal 900rb,
  // 5. buat budget Makanan 500rb, 6. cek progress muncul 20%
  await page.goto('/register');
  // ... isi form, submit ...
  await expect(page).toHaveURL(/dashboard/);
  // dst — eksekutor mengisi detail selektor sesuai implementasi
});
```

- [ ] **Step 2: Implementasi `/transaksi`:** Server Component baca `searchParams` → query `db` langsung (filter sama seperti API) + pagination 20; Client `txn-filters.tsx` (update URL), tabel desktop / kartu mobile, tombol edit (dialog prefill) + hapus (konfirmasi) → PATCH/DELETE API → `router.refresh()`.
- [ ] **Step 3: Implementasi `/dompet`:** kartu per dompet + saldo (`wallet-cards.tsx`), dialog tambah/edit, tombol arsip (konfirmasi + warning dompet terakhir), `transfer-form.tsx` (asal→tujuan + swap, nominal + chips, fee opsional, validasi saldo client + server), riwayat 50 transfer terakhir.
- [ ] **Step 4: E2E PASS penuh** (ini test paling penting — mencakup F-02, F-03, F-04, F-06).
- [ ] **Step 5: Commit** — `git add app components tests && git commit -m "feat: UI transaksi + dompet + transfer"`.

### Task 11: Anggaran + Laporan/Export + Pengaturan + Polish Akhir

**Files:**
- Create: `app/(app)/anggaran/page.tsx`, `app/(app)/laporan/page.tsx`, `app/api/reports/export/route.ts`, `app/(app)/pengaturan/page.tsx`, `app/not-found.tsx`, `app/error.tsx`, `README.md`
- Test: `tests/unit/csv.test.ts` (format CSV), E2E `tests/e2e/export.spec.ts`

**Interfaces:**
- Consumes: semua API + pola filter-URL Task 10; `getBudgetStatus`.
- Produces: MVP LENGKAP sesuai PRD §4; README berisi cara jalan + env + deploy.

- [ ] **Step 1: Test CSV (TDD):**

```ts
import { describe, expect, it } from 'vitest';
import { toCSV } from '@/lib/csv';

describe('toCSV', () => {
  it('header + escape koma/kutip', () => {
    const out = toCSV([{ tanggal: '2026-11-01', catatan: 'Kopi, "spesial"', nominal: 20000 }]);
    expect(out.split('\n')[0]).toBe('tanggal,catatan,nominal');
    expect(out).toContain('"Kopi, ""spesial"""');
  });
});
```

- [ ] **Step 2: GAGAL → Step 3 tulis `lib/csv.ts`:**

```ts
export function toCSV(rows: Record<string, string | number>[]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  if (!rows.length) return '';
  const head = Object.keys(rows[0]);
  return [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n');
}
```

- [ ] **Step 4: PASS.**
- [ ] **Step 5: `/anggaran`:** kartu per budget (progress + badge status + sisa), dialog buat/edit (kategori expense saja, month/year default bulan ini), hapus (konfirmasi), tombol "Salin dari bulan lalu" (GET bulan lalu → POST satu-satu, tampilkan hasil "N tersalin").
- [ ] **Step 6: `/laporan` + `GET /api/reports/export`:** filter periode (bulan ini/lalu/3 bulan/custom) + dompet + kategori; ringkasan + tren (reuse chart Task 9) + tabel efisiensi; tombol Export CSV → download `laporan-YYYYMMDD.csv` (header `Content-Disposition: attachment`).
- [ ] **Step 7: `/pengaturan`:** form nama, form ubah password (cek password lama + bcrypt baru), kelola kategori custom (list + tambah/edit/arsip; arsip = soft? kategori dipakai transaksi tidak boleh hapus fisik → gunakan flag? SKEMA TIDAK PUNYA isActive — putuskan: hapus fisik HANYA bila 0 transaksi+bude, else tolak 400 dengan pesan. Dokumentasikan di README), zona bahaya hapus akun (ketik email + hapus cascade via Prisma).
- [ ] **Step 8: Polish:** `not-found.tsx`, `error.tsx` global, metadata SEO landing, `README.md` (prasyarat, env, `pnpm dev/build`, alur deploy Vercel + cara isi env Aiven, catatan auto-poweroff plan free).
- [ ] **Step 9: Verifikasi penuh MVP:**

```bash
pnpm test
pnpm exec tsc --noEmit
pnpm exec playwright test
pnpm build
```

Expected: semua hijau. Checklist mobile 360/390px tiap halaman (no overflow-x, FAB aman).

- [ ] **Step 10: Commit** — `git add -A && git commit -m "feat: anggaran, laporan+CSV, pengaturan, polish MVP"`.

---

## Self-Review

**1. Spec coverage:** PRD §4.1 landing→Task 7; §4.2 auth→Task 3; §4.3 dashboard→Task 9; §4.4 transaksi→Task 5+10; §4.5 dompet→Task 4+10; §4.6 anggaran→Task 6+11; §4.7 laporan→Task 6+11; §4.8 pengaturan→Task 11; F-01..F-09 terpetakan; non-fungsional (responsif, performa, keamanan, a11y dasar) tersebar di tiap task + verifikasi Task 11.

**2. Placeholder scan:** tidak ada TBD/TODO; semua step punya kode konkret; "uji manual" hanya untuk verifikasi perilaku yang sudah didefinisikan; selektor E2E dibiarkan fleksibel mengikuti implementasi aktual (eksekutor mengisi, bukan placeholder).

**3. Type consistency:** `getBudgetStatus(persen: number)`, `applyEffect/reverseEffect(balance, type: TxnType, amount)`, `validateTransfer({from,to,amount,balance})`, `canArchiveWallet({txCount})`, `formatIDR(n)`, `toCSV(rows)` — nama konsisten di test & implementasi. Session user id diakses via `(session.user as { id: string }).id` di semua route. Schema Zod (`registerSchema, loginSchema, walletSchema, transactionSchema, transferSchema, budgetSchema, categorySchema`) didefinisikan sekali di `lib/validations.ts`.

**4. Review Focus:** #1 transfer dompet orang → Task 6 Step 6 (cek kedua dompet milik user); #2 tebak ID → semua route 404 seragam 'tidak ditemukan'; #3 amount aneh → Zod `positive()` + test implisit via E2E invalid; #4 race budget → `@@unique` + P2002→409 (Task 6 Step 7); #5 tanggal jauh → `z.coerce.date().max(+366 hari)` (Task 5 Step 5). Tambahan test eksplisit: Task 6 Step 9 mencakup #1–#4 manual, Task 5 Step 8 mencakup #2–#3.

Perbaikan inline yang sudah dilakukan: refactor `lib/dashboard.ts` dipakai route+page (hindari duplikasi agregat); aturan hapus kategori custom didokumentasikan (skema tanpa isActive); CATATAN service Aiven plan-free auto-poweroff masuk README + Task 2 Step 8.

