import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().trim().toLowerCase().email('Email tidak valid').max(254),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email tidak valid').max(254),
  password: z.string().min(1, 'Password wajib diisi').max(72),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const walletSchema = z.object({
  name: z.string().min(2, 'Nama dompet minimal 2 karakter').max(30),
  type: z.enum(['CASH', 'BANK', 'E_WALLET']),
  balance: z.number().min(0, 'Saldo awal tidak boleh negatif').max(999_000_000_000),
  icon: z.string().max(30).default('wallet'),
});
export type WalletInput = z.infer<typeof walletSchema>;

export const transactionSchema = z.object({
  walletId: z.string().cuid('Dompet tidak valid'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
  date: z.coerce.date().max(new Date(Date.now() + 366 * 86400000), 'Tanggal terlalu jauh'),
  note: z.string().max(200).optional(),
  // Fase 3: nominal boleh dikirim dalam mata uang lain; server mengonversi.
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).optional().default('IDR'),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const transferSchema = z
  .object({
    fromWalletId: z.string().cuid(),
    toWalletId: z.string().cuid(),
    amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
    fee: z.number().min(0).max(999_000_000).optional().default(0),
    date: z.coerce.date(),
    note: z.string().max(200).optional(),
  })
  .refine((v) => v.fromWalletId !== v.toWalletId, {
    message: 'Dompet asal dan tujuan harus berbeda',
  });
export type TransferInput = z.infer<typeof transferSchema>;

export const budgetSchema = z.object({
  categoryId: z.string().cuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  limit: z.number().positive().max(999_000_000_000),
});
export type BudgetInput = z.infer<typeof budgetSchema>;

export const categorySchema = z.object({
  name: z.string().min(2).max(30),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().max(30).default('tag'),
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
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
    note: z.string().max(200).optional(),
    freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    interval: z.number().int().min(1).max(12).default(1),
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
  targetAmount: z.number().positive('Target harus > 0').max(999_000_000_000),
  currency: z.enum(['IDR', 'USD', 'EUR', 'SGD', 'MYR']).default('IDR'),
  targetDate: z.coerce.date().optional().nullable(),
  icon: z.string().max(30).default('savings'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#2fa084'),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const goalEntrySchema = z.object({
  goalId: z.string().cuid(),
  amount: z.number().positive('Nominal harus > 0').max(999_000_000_000),
  type: z.enum(['DEPOSIT', 'WITHDRAW']),
  note: z.string().max(200).optional(),
  date: z.coerce.date().optional(),
});
export type GoalEntryInput = z.infer<typeof goalEntrySchema>;

export const householdCreateSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(50),
});

export const householdJoinSchema = z.object({
  inviteCode: z.string().trim().min(6, 'Kode undangan tidak valid').max(12),
});

export const walletHouseholdSchema = z.object({
  householdId: z.string().cuid().nullable(),
});
