import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recurringSchema } from '@/lib/validations';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';
import { writeAudit } from '@/lib/audit';
import { runDueRecurring, describeRule, type Freq } from '@/lib/recurring';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  // Jalankan yang sudah jatuh tempo setiap kali daftar dibuka, supaya
  // pengguna melihat efeknya tanpa menunggu cron.
  await runDueRecurring(userId).catch(() => 0);

  const data = await db.recurringRule.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { nextRun: 'asc' }],
  });

  const walletIds = [...new Set(data.map((r) => r.walletId))];
  const categoryIds = [...new Set(data.map((r) => r.categoryId))];
  const [wallets, categories] = await Promise.all([
    db.wallet.findMany({ where: { id: { in: walletIds }, userId }, select: { id: true, name: true } }),
    db.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, icon: true } }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w.name]));
  const catMap = new Map(categories.map((c) => [c.id, c]));

  return NextResponse.json({
    data: data.map((r) => ({
      ...r,
      walletName: walletMap.get(r.walletId) ?? '—',
      categoryName: catMap.get(r.categoryId)?.name ?? '—',
      schedule: describeRule(r.freq as Freq, r.interval),
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  if (!rateLimit(req, `recurring:create:${userId}`, 30, 60_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = recurringSchema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const v = parsed.data;

  // Ownership check: dompet & kategori harus milik user (atau kategori global).
  const [wallet, category] = await Promise.all([
    db.wallet.findFirst({ where: { id: v.walletId, userId, isActive: true } }),
    db.category.findFirst({ where: { id: v.categoryId, OR: [{ userId }, { userId: null }] } }),
  ]);
  if (!wallet) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  if (!category) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  if (category.type !== v.type) {
    return NextResponse.json(
      { error: 'Tipe transaksi tidak cocok dengan tipe kategori' },
      { status: 400 },
    );
  }

  const data = await db.recurringRule.create({
    data: {
      userId,
      walletId: v.walletId,
      categoryId: v.categoryId,
      type: v.type,
      amount: v.amount,
      note: v.note,
      freq: v.freq,
      interval: v.interval,
      startDate: v.startDate,
      endDate: v.endDate ?? null,
      nextRun: v.startDate,
      status: 'ACTIVE',
    },
  });

  await writeAudit({
    userId,
    action: 'recurring.create',
    entity: 'RecurringRule',
    entityId: data.id,
    summary: `${describeRule(v.freq as Freq, v.interval)} · ${v.note ?? category.name}`,
  });

  return NextResponse.json({ data }, { status: 201 });
}
