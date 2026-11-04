# PRD — Aplikasi Pencatatan Pengeluaran Keuangan Personal

> Status: v1.0 — Disetujui 4 Nov 2026 · Hasil brainstorming

## 1. Ringkasan

Web app pencatatan keuangan **personal** (satu role: user). Mencatat pemasukan & pengeluaran, mengelola banyak dompet (cash/bank/e-wallet) + transfer antar dompet, mengatur budget bulanan per kategori dengan peringatan, serta melihat dashboard grafik yang premium dan responsif (desktop + mobile). Tech stack: **Next.js 15 + Prisma + Auth.js + PostgreSQL (Aiven)**, deploy **Vercel** dalam 1 repo.

## 2. Tujuan & Kriteria Sukses

- User bisa register → buat dompet → catat transaksi pertama dalam < 3 menit.
- Dashboard menjawab dalam 5 detik: "bulan ini keluar berapa, sisa budget apa saja".
- 100% halaman bisa dipakai di HP (360px) dan desktop (1440px) tanpa layout rusak.
- Deploy Vercel + konek Aiven Postgres, tidak ada error build.

## 3. Target Pengguna

Individu yang mengatur uang sendiri: karyawan, freelancer, mahasiswa. Satu akun = satu orang, datanya privat (tidak ada sharing/role admin).

## 4. Scope MVP (Fase 1)

### 4.1 Landing page `/` (publik)
Hero + CTA, fitur unggulan, cara kerja, pricing dummy (Gratis/Premium), testimoni, FAQ, footer. SEO basic (metadata + semantic HTML).

### 4.2 Auth `/login` `/register`
- Email + password saja (Google OAuth = Fase 2).
- Validasi Zod, hash bcrypt 12 rounds, session Auth.js v5.
- Register sukses → onboarding buat dompet pertama → `/dashboard`.

### 4.3 Dashboard `/dashboard`
- 4 stat cards: Total saldo, Pemasukan bulan ini, Pengeluaran bulan ini, Sisa budget (total limit − terpakai).
- Grafik arus kas 30 hari (area chart), donut pengeluaran per kategori, budget progress top-5, 5 transaksi terakhir, tombol "Catat cepat".

### 4.4 Transaksi `/transaksi`
- CRUD penuh: tipe (masuk/keluar), jumlah, tanggal, dompet, kategori, catatan.
- Filter: rentang tanggal, kategori, dompet, tipe, search catatan. Sort tanggal terbaru. Pagination 20/halaman.
- Edit/hapus transaksi → saldo dompet terkoreksi otomatis (atomic).

### 4.5 Dompet `/dompet`
- CRUD dompet: nama, tipe (CASH/BANK/E_WALLET), saldo awal, ikon.
- Transfer antar dompet: pilih asal → tujuan, jumlah, tanggal, catatan, biaya opsional. Validasi saldo cukup + dompet berbeda.
- Arsipkan dompet (soft, `isActive=false`) bukan hapus fisik bila ada transaksi.

### 4.6 Anggaran `/anggaran`
- Set budget per kategori pengeluaran per bulan (bulan+tahun).
- Progress bar per budget: < 80% hijau, 80–100% kuning + badge "Hampir habis", > 100% merah + badge "Melebihi".
- Duplikasi budget bulan lalu dengan 1 klik ("Salin dari bulan lalu").

### 4.7 Laporan `/laporan`
- Filter periode (bulan ini, bulan lalu, 3 bulan, custom) + per dompet/kategori.
- Ringkasan + tren + breakdown + export CSV (PDF = Fase 2).

### 4.8 Pengaturan `/pengaturan`
Profil (nama), ubah password, kelola kategori custom (tambah/edit/arsip), hapus akun (dengan konfirmasi ketik email).

## 5. Di Luar Scope MVP

Multi-user/keluarga, mobile native, Google OAuth, export PDF, transaksi berulang/otomatis, multi-currency, PWA offline, notifikasi push/email. Semua masuk Fase 2.

## 6. Kebutuhan Fungsional (ringkas)

| ID | Kebutuhan |
|----|-----------|
| F-01 | Register/login/logout dengan session aman |
| F-02 | CRUD dompet + saldo konsisten otomatis |
| F-03 | CRUD transaksi pemasukan/pengeluaran |
| F-04 | Transfer antar dompet atomic |
| F-05 | Kategori global (bawaan) + custom per user |
| F-06 | CRUD budget bulanan + status peringatan |
| F-07 | Dashboard agregat + grafik |
| F-08 | Laporan filter periode + export CSV |
| F-09 | Proteksi route: yang belum login tidak bisa akses `/dashboard` dst |

## 7. Kebutuhan Non-fungsional

- **Responsif:** 360px–1440px, bottom-nav + FAB di mobile, sidebar di desktop.
- **Performa:** dashboard LCP < 2.5s, pagination server-side, index DB `(userId, date)`.
- **Keamanan:** bcrypt, session httpOnly, Zod server-side, Prisma parameterized query, rate-limit login (Fase 2).
- **Aksesibilitas dasar:** label form, kontras cukup, target sentuh ≥ 44px, keyboard-navigable.
- **Observabilitas:** logging error server, halaman error/404 custom.

## 8. Asumsi & Keputusan

1. Satu role (user) — tanpa admin (sesuai permintaan user 3 Nov 2026).
2. DB PostgreSQL di **Aiven** (dibuatkan via MCP Aiven setelah spec di-approve), koneksi pooler + directUrl untuk migrasi.
3. Mata uang tunggal IDR, format `Rp` (multi-currency Fase 2).
4. Saldo dompet = sumber kebenaran terhitung (di-update atomic tiap transaksi, bukan sekadar view).

## 9. Roadmap

- **Fase 1 (MVP):** semua di §4. Deploy Vercel + Aiven.
- **Fase 2:** Google OAuth, export PDF, transaksi berulang, PWA, dark-mode penuh, rate-limit + audit log.
- **Fase 3:** target menabung, multi-currency, sharing keluarga (multi-user).

## 10. Risiko

- Cold-start serverless + koneksi DB jauh (Aiven region) → mitigasi: pooler + pilih region Aiven terdekat (SG), Prisma `connection_limit=1..2` di serverless.
- Saldo tidak konsisten bila update tidak atomic → mitigasi: selalu pakai Prisma interactive transaction.
