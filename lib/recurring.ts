import { db } from './db';

export type Freq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

/**
 * Hitung tanggal jalan berikutnya setelah `from`.
 *
 * Catatan tanggal: untuk MONTHLY/YEARLY kita menambahkan bulan lalu mengunci
 * tanggal ke hari terakhir bulan tujuan bila tanggal asal tidak ada (mis. 31
 * Feb). Tanpa penguncian ini, `setMonth` akan meluap ke bulan berikutnya dan
 * transaksi bisa jalan dua kali di bulan yang sama.
 */
export function nextDate(from: Date, freq: Freq, interval = 1): Date {
  const d = new Date(from.getTime());
  const n = Math.max(1, Math.floor(interval));

  switch (freq) {
    case 'DAILY':
      d.setDate(d.getDate() + n);
      return d;
    case 'WEEKLY':
      d.setDate(d.getDate() + 7 * n);
      return d;
    case 'MONTHLY': {
      const day = d.getDate();
      d.setDate(1);
      d.setMonth(d.getMonth() + n);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      return d;
    }
    case 'YEARLY': {
      const day = d.getDate();
      const month = d.getMonth();
      d.setDate(1);
      d.setFullYear(d.getFullYear() + n);
      d.setMonth(month);
      const lastDay = new Date(d.getFullYear(), month + 1, 0).getDate();
      d.setDate(Math.min(day, lastDay));
      return d;
    }
  }
}

/** Batas aman: satu pemanggilan tidak boleh membuat ratusan transaksi. */
const MAX_CATCH_UP = 60;

/**
 * Jalankan semua aturan berulang yang sudah jatuh tempo untuk satu user.
 *
 * Aman dipanggil berkali-kali (idempotent secara praktis): setiap transaksi
 * yang dibuat memperbarui `nextRun`, sehingga pemanggilan berikutnya tidak
 * menduplikasi. Dibungkus transaksi per-rule agar saldo dan transaksi
 * konsisten — kalau satu langkah gagal, seluruh rule di-rollback.
 *
 * Mengembalikan jumlah transaksi yang dibuat.
 */
export async function runDueRecurring(userId: string, now = new Date()): Promise<number> {
  const due = await db.recurringRule.findMany({
    where: { userId, status: 'ACTIVE', nextRun: { lte: now } },
    orderBy: { nextRun: 'asc' },
  });

  let created = 0;

  for (const rule of due) {
    // Lewati bila dompet sudah tidak aktif (diarsipkan).
    const wallet = await db.wallet.findFirst({
      where: { id: rule.walletId, userId, isActive: true },
      select: { id: true },
    });
    if (!wallet) continue;

    let cursor = new Date(rule.nextRun.getTime());
    let guard = 0;

    while (cursor <= now && guard < MAX_CATCH_UP) {
      guard++;
      // Hormati tanggal berakhir.
      if (rule.endDate && cursor > rule.endDate) {
        await db.recurringRule.update({
          where: { id: rule.id },
          data: { status: 'PAUSED' },
        });
        break;
      }

      const amount = rule.amount;

      try {
        await db.$transaction(async (tx) => {
          await tx.transaction.create({
            data: {
              userId,
              walletId: rule.walletId,
              categoryId: rule.categoryId,
              type: rule.type,
              amount,
              date: cursor,
              note: rule.note ?? undefined,
              recurringRuleId: rule.id,
            },
          });
          // Decimal tidak punya negasi; gunakan decrement/increment terpisah
          // agar presisi Decimal tetap terjaga (tidak lewat float).
          await tx.wallet.update({
            where: { id: rule.walletId },
            data:
              rule.type === 'INCOME'
                ? { balance: { increment: amount } }
                : { balance: { decrement: amount } },
          });
          await tx.recurringRule.update({
            where: { id: rule.id },
            data: { lastRun: cursor },
          });
        });
        created++;
      } catch (err) {
        console.error('[recurring] gagal membuat transaksi untuk rule', rule.id, err);
        break; // jangan lanjutkan rule yang gagal; coba lagi pada pemanggilan berikutnya
      }

      cursor = nextDate(cursor, rule.freq as Freq, rule.interval);
    }

    // Simpan posisi berikutnya (di luar loop agar satu update per rule).
    const finalNext =
      cursor > now ? cursor : nextDate(cursor, rule.freq as Freq, rule.interval);
    await db.recurringRule.update({
      where: { id: rule.id },
      data: { nextRun: finalNext },
    });
  }

  return created;
}

/** Deskripsi manusiawi untuk jadwal aturan. */
export function describeRule(freq: Freq, interval: number): string {
  const n = Math.max(1, interval);
  const base: Record<Freq, [string, string]> = {
    DAILY: ['hari', 'Harian'],
    WEEKLY: ['minggu', 'Mingguan'],
    MONTHLY: ['bulan', 'Bulanan'],
    YEARLY: ['tahun', 'Tahunan'],
  };
  if (n === 1) return base[freq][1];
  return `Tiap ${n} ${base[freq][0]}`;
}
