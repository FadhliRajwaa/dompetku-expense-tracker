import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
  email: z.string().trim().toLowerCase().email('Email tidak valid').max(254, 'Email terlalu panjang'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72, 'Password maksimal 72 karakter'),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email tidak valid').max(254, 'Email terlalu panjang'),
  password: z.string().min(1, 'Password wajib diisi').max(72, 'Password maksimal 72 karakter'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const walletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter').max(30, 'Nama dompet maksimal 30 karakter'),
  type: z.enum(['CASH', 'BANK', 'E_WALLET'], { message: 'Tipe dompet tidak dikenal' }),
  balance: z.number().min(0, 'Saldo awal tidak boleh negatif').max(999_000_000_000, 'Saldo awal terlalu besar'),
  icon: z.string().max(30, 'Ikon terlalu panjang').default('wallet'),
});
export type WalletInput = z.infer<typeof walletSchema>;

export const transactionSchema = z.object({
  walletId: z.string().cuid('Dompet tidak valid'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'Jenis transaksi tidak dikenal' }),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000, 'Nominal terlalu besar'),
  date: z.coerce.date().max(new Date(Date.now() + 366 * 86400000), 'Tanggal terlalu jauh'),
  note: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
  // Fase 3: nominal boleh dikirim dalam mata uang lain; server mengonversi.
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).optional().default('IDR'),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z
  .object({
    fromWalletId: z.string().cuid(),
    toWalletId: z.string().cuid(),
    amount: z.number().positive('Nominal harus > 0').max(999_000_000_000, 'Nominal terlalu besar'),
    fee: z.number().min(0).max(999_000_000).optional().default(0),
    date: z.coerce.date(),
    note: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
  })
  .refine((v) => v.fromWalletId !== v.toWalletId, {
    message: 'Dompet asal dan tujuan harus berbeda',
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const budgetSchema = z.object({
  categoryId: z.string().cuid(),
  month: z.number().int().min(1, 'Bulan tidak valid').max(12, 'Bulan tidak valid'),
  year: z.number().int().min(2020, 'Tahun tidak valid').max(2100, 'Tahun tidak valid'),
  limit: z.number().positive('Batas anggaran harus > 0').max(999_000_000_000, 'Batas anggaran terlalu besar'),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter').max(30, 'Nama kategori maksimal 30 karakter'),
  type: z.enum(['INCOME', 'EXPENSE'], { message: 'Jenis transaksi tidak dikenal' }),
  icon: z.string().max(30, 'Ikon terlalu panjang').default('tag'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Warna harus hex #rrggbb').default('#2fa084'),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// ============================================================================
// FASE 2
// ============================================================================

export const recurringSchema = z
  .object({
    walletId: z.string().cuid('Dompet tidak valid'),
    categoryId: z.string().cuid('Kategori tidak valid'),
    type: z.enum(['INCOME', 'EXPENSE'], { message: 'Jenis transaksi tidak dikenal' }),
    amount: z.number().positive('Nominal harus > 0').max(999_000_000_000, 'Nominal terlalu besar'),
    note: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
    freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], { message: 'Frekuensi tidak dikenal' }),
    interval: z.number().int().min(1, 'Interval minimal 1').max(12, 'Interval maksimal 12').default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: 'Tanggal berakhir harus setelah tanggal mulai',
  });
export type RecurringInput = z.infer<typeof recurringSchema>;

export const profilePrefsSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).optional(),
});

// ============================================================================
// FASE 3
// ============================================================================

export const goalSchema = z.object({
  name: z.string().trim().min(2, 'Nama target minimal 2 karakter').max(50),
  targetAmount: z.number().positive('Target harus > 0').max(999_000_000_000, 'Target terlalu besar'),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  targetDate: z.coerce.date().optional().nullable(),
  icon: z.string().max(30, 'Ikon terlalu panjang').default('savings'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#2fa084'),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const goalEntrySchema = z.object({
  goalId: z.string().cuid(),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000, 'Nominal terlalu besar'),
  type: z.enum(['DEPOSIT', 'WITHDRAW']),
  note: z.string().max(200, 'Catatan maksimal 200 karakter').optional(),
  date: z.coerce.date().optional(),
});
export type GoalEntryInput = z.infer<typeof goalEntrySchema>;

export const householdCreateSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50, 'Nama maksimal 50 karakter'),
});

export const householdJoinSchema = z.object({
  inviteCode: z.string().trim().min(6, 'Kode undangan tidak valid').max(12, 'Kode undangan tidak valid'),
});

export const walletHouseholdSchema = z.object({
  householdId: z.string().cuid().nullable(),
});
