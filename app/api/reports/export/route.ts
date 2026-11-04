import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { toCSV } from '@/lib/csv';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const q = new URL(req.url).searchParams;
  const format = q.get('format') ?? 'csv';
  if (format !== 'csv') return Response.json({ error: 'Format tidak didukung' }, { status: 400 });

  const where: Prisma.TransactionWhereInput = { userId };
  if (q.get('from') || q.get('to')) {
    where.date = {};
    const from = q.get('from');
    const to = q.get('to');
    if (from && !Number.isNaN(Date.parse(from))) (where.date as Prisma.DateTimeFilter).gte = new Date(from);
    if (to && !Number.isNaN(Date.parse(to))) (where.date as Prisma.DateTimeFilter).lte = new Date(to);
  }
  if (q.get('walletId')) where.walletId = q.get('walletId')!;
  if (q.get('categoryId')) where.categoryId = q.get('categoryId')!;

  const txns = await db.transaction.findMany({ where, orderBy: { date: 'desc' }, take: 5000 });
  if (!txns.length) {
    return new Response('', {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }
  const [wallets, categories] = await Promise.all([
    db.wallet.findMany({ where: { id: { in: [...new Set(txns.map((t) => t.walletId))] } } }),
    db.category.findMany({ where: { id: { in: [...new Set(txns.map((t) => t.categoryId))] } } }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const csv =
    '﻿' +
    toCSV(
      txns.map((t) => ({
        tanggal: t.date.toISOString().slice(0, 10),
        tipe: t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
        kategori: catMap.get(t.categoryId) ?? '',
        dompet: walletMap.get(t.walletId) ?? '',
        catatan: t.note ?? '',
        nominal: Number(t.amount),
      })),
    );
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="laporan-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
