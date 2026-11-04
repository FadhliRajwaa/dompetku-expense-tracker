import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
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
