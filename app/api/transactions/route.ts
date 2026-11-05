import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from "@/lib/validations";
import { readJson, rateLimit, rateLimitedResponse } from "@/lib/rate-limit";
import { getRateToIdr } from "@/lib/currency";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const q = new URL(req.nextUrl).searchParams;
  const page = Math.max(1, Number(q.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(q.get('limit') ?? 20)));
  const where: Prisma.TransactionWhereInput = { userId };
  if (q.get('type') === 'INCOME' || q.get('type') === 'EXPENSE') where.type = q.get('type') as 'INCOME' | 'EXPENSE';
  if (q.get('walletId')) where.walletId = q.get('walletId')!;
  if (q.get('categoryId')) where.categoryId = q.get('categoryId')!;
  if (q.get('from') || q.get('to')) {
    where.date = {};
    if (q.get('from')) (where.date as Prisma.DateTimeFilter).gte = new Date(q.get('from')!);
    if (q.get('to')) (where.date as Prisma.DateTimeFilter).lte = new Date(q.get('to')!);
  }
  if (q.get('q')) where.note = { contains: q.get('q')!, mode: 'insensitive' };
  const [items, total] = await Promise.all([
    db.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.transaction.count({ where }),
  ]);
  const walletMap = new Map(
    (await db.wallet.findMany({ where: { id: { in: [...new Set(items.map((t) => t.walletId))] } } })).map((w) => [w.id, w]),
  );
  const enriched = items.map((t) => ({ ...t, wallet: walletMap.get(t.walletId) ?? null }));
  return NextResponse.json({ data: enriched, meta: { page, limit, total } });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = transactionSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { walletId, categoryId, type, amount, date, note } = parsed.data;

  if (!rateLimit(req, `txn:create:${userId}`, 120, 60_000)) return rateLimitedResponse();

  const wallet = await db.wallet.findFirst({ where: { id: walletId, userId, isActive: true } });
  if (!wallet) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const category = await db.category.findFirst({ where: { id: categoryId, OR: [{ userId }, { userId: null }] } });
  if (!category) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  if (category.type !== type) {
    return NextResponse.json({ error: 'Tipe transaksi tidak cocok dengan tipe kategori' }, { status: 400 });
  }

  // Multi-currency: `amount` selalu dalam mata uang dompet akun (IDR).
  // Bila pengguna memasukkan mata uang lain, server yang menghitung konversinya
  // (client tidak boleh mengirim hasil konversi sendiri).
  const currency = (parsed.data as { currency?: string }).currency ?? 'IDR';
  const rate = await getRateToIdr(currency);
  const amountIdr = currency === 'IDR' ? amount : Math.round(amount * rate * 100) / 100;

  const data = await db.$transaction(async (tx) => {
    const txn = await tx.transaction.create({
      data: {
        userId,
        walletId,
        categoryId,
        type,
        amount: amountIdr,
        date,
        note,
        currency,
        fxRate: rate,
      },
    });
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: type === 'EXPENSE' ? { decrement: amountIdr } : { increment: amountIdr } },
    });
    return txn;
  });
  return NextResponse.json({ data }, { status: 201 });
}
