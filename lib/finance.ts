export type BudgetStatus = 'aman' | 'hampir-habis' | 'melebihi';
export type TxnType = 'INCOME' | 'EXPENSE';

/** persen = terpakai/limit*100 */
export function getBudgetStatus(persen: number): BudgetStatus {
  if (persen > 100) return 'melebihi';
  if (persen >= 80) return 'hampir-habis';
  return 'aman';
}

export function applyEffect(balance: number, type: TxnType, amount: number): number {
  return type === 'EXPENSE' ? balance - amount : balance + amount;
}

export function reverseEffect(balance: number, type: TxnType, amount: number): number {
  return type === 'EXPENSE' ? balance + amount : balance - amount;
}

export function canArchiveWallet(_w?: { txCount: number }): { ok: true } {
  void _w;
  return { ok: true };
}

export function validateTransfer(w: {
  from: string;
  to: string;
  amount: number;
  balance: number;
}): { ok: boolean; error?: string } {
  if (w.from === w.to) return { ok: false, error: 'Dompet asal dan tujuan harus berbeda' };
  if (!(w.amount > 0)) return { ok: false, error: 'Nominal harus > 0' };
  if (w.amount > w.balance) return { ok: false, error: 'Saldo dompet asal tidak cukup' };
  return { ok: true };
}
