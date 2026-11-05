import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { toCSV } from '@/lib/csv';
import { buildReportPdf, type PdfRow } from '@/lib/pdf';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const q = new URL(req.url).searchParams;
  const format = q.get('format') ?? 'csv';
  if (format !== 'csv' && format !== 'pdf') {
    return Response.json({ error: 'Format tidak didukung' }, { status: 400 });
  }

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
  const [wallets, categories] = await Promise.all([
    db.wallet.findMany({ where: { userId } }),
    db.category.findMany({ where: { OR: [{ userId }, { userId: null }] } }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const stamp = new Date().toISOString().slice(0, 10);

  // ---------------- CSV ----------------
  if (format === 'csv') {
    if (!txns.length) {
      return new Response('', {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="laporan-${stamp}.csv"`,
        },
      });
    }
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
        'Content-Disposition': `attachment; filename="laporan-${stamp}.csv"`,
      },
    });
  }

  // ---------------- PDF ----------------
  const income = txns.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txns.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

  const catTotals = new Map<string, number>();
  for (const t of txns) {
    if (t.type !== 'EXPENSE') continue;
    const name = catMap.get(t.categoryId) ?? 'Lainnya';
    catTotals.set(name, (catTotals.get(name) ?? 0) + Number(t.amount));
  }
  const perCategory = [...catTotals.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const rows: PdfRow[] = txns.map((t) => ({
    date: t.date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    type: t.type,
    category: catMap.get(t.categoryId) ?? '—',
    wallet: walletMap.get(t.walletId) ?? '—',
    note: t.note ?? '',
    amount: Number(t.amount),
  }));

  const from = q.get('from') ? new Date(q.get('from')!) : null;
  const to = q.get('to') ? new Date(q.get('to')!) : null;
  const period =
    from && to
      ? `${from.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} — ${to.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : 'Seluruh periode';

  const pdf = await buildReportPdf(
    {
      title: 'Laporan Keuangan',
      period,
      owner: session.user.name ?? session.user.email ?? 'Pengguna DompetKu',
      income,
      expense,
      perCategory,
    },
    rows,
  );

  return new Response(pdf as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="laporan-dompetku-${stamp}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
