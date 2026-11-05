import { db } from './db';

/**
 * Tulis audit log. Selalu dipanggil server-side dengan userId dari session —
 * tidak pernah menerima userId dari body request (cegah spoofing).
 *
 * Kegagalan menulis log TIDAK boleh menggagalkan operasi utama, jadi error
 * ditelan setelah dicatat ke console. Log adalah jejak, bukan sumber kebenaran.
 */
export async function writeAudit(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
  meta?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        summary: params.summary,
        meta: params.meta ? (params.meta as object) : undefined,
      },
    });
  } catch (err) {
    console.error('[audit] gagal menulis log:', params.action, err);
  }
}

export const AUDIT_LABEL: Record<string, string> = {
  'budget.create': 'Anggaran dibuat',
  'budget.update': 'Anggaran diubah',
  'budget.delete': 'Anggaran dihapus',
  'budget.copy': 'Anggaran disalin',
  'goal.create': 'Target dibuat',
  'goal.update': 'Target diubah',
  'goal.delete': 'Target dihapus',
  'goal.deposit': 'Dana ditambahkan',
  'goal.withdraw': 'Dana ditarik',
  'recurring.create': 'Transaksi berulang dibuat',
  'recurring.pause': 'Transaksi berulang dijeda',
  'recurring.resume': 'Transaksi berulang dilanjutkan',
  'recurring.delete': 'Transaksi berulang dihapus',
  'household.create': 'Rumah tangga dibuat',
  'household.join': 'Bergabung ke rumah tangga',
  'household.leave': 'Keluar dari rumah tangga',
  'household.wallet.link': 'Dompet dibagikan',
  'household.wallet.unlink': 'Dompet ditarik dari rumah tangga',
  'account.profile': 'Profil diperbarui',
  'account.password': 'Kata sandi diubah',
};

export function auditLabel(action: string) {
  return AUDIT_LABEL[action] ?? action;
}
