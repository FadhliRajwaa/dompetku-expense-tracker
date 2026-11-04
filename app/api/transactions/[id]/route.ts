import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionSchema } from '@/lib/validations';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const old = await db.transaction.findFirst({ where: { id, userId } });
  if (!old) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  const parsed = transactionSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  if (parsed.data.walletId) {
    const w = await db.wallet.findFirst({ where: { id: parsed.data.walletId, userId, isActive: true } });
    if (!w) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  }
  if (parsed.data.categoryId) {
    const c = await db.category.findFirst({
      where: { id: parsed.data.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!c) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
  }
  const data = await db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: old.walletId },
      data: { balance: old.type === 'EXPENSE' ? { increment: old.amount } : { decrement: old.amount } },
    });
    const next = {
      walletId: parsed.data.walletId ?? old.walletId,
      categoryId: parsed.data.categoryId ?? old.categoryId,
      type: parsed.data.type ?? old.type,
      amount: parsed.data.amount ?? Number(old.amount),
      date: parsed.data.date ?? old.date,
      note: parsed.data.note ?? old.note,
    };
    await tx.wallet.update({
      where: { id: next.walletId },
      data: { balance: next.type === 'EXPENSE' ? { decrement: next.amount } : { increment: next.amount } },
    });
    return tx.transaction.update({ where: { id }, data: next });
  });
  return NextResponse.json({ data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const { id } = await params;
  const old = await db.transaction.findFirst({ where: { id, userId } });
  if (!old) return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
  await db.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: old.walletId },
      data: { balance: old.type === 'EXPENSE' ? { increment: old.amount } : { decrement: old.amount } },
    });
    await tx.transaction.delete({ where: { id } });
  });
  return NextResponse.json({ data: { id } });
}
