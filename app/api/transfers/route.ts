import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transferSchema } from '@/lib/validations';
import { validateTransfer } from '@/lib/finance';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const items = await db.transfer.findMany({
    where: { userId: (session.user as { id: string }).id },
    orderBy: { date: 'desc' },
    take: 50,
  });
  return NextResponse.json({ data: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const parsed = transferSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { fromWalletId, toWalletId, amount, fee = 0, date, note } = parsed.data;
  const wallets = await db.wallet.findMany({
    where: { id: { in: [fromWalletId, toWalletId] }, userId, isActive: true },
  });
  if (wallets.length !== 2) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
  const from = wallets.find((w) => w.id === fromWalletId)!;
  const guard = validateTransfer({ from: fromWalletId, to: toWalletId, amount: amount + fee, balance: Number(from.balance) });
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: 400 });
  const data = await db.$transaction(async (tx) => {
    await tx.wallet.update({ where: { id: fromWalletId }, data: { balance: { decrement: amount + fee } } });
    await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: amount } } });
    return tx.transfer.create({ data: { userId, fromWalletId, toWalletId, amount, fee, date, note } });
  });
  return NextResponse.json({ data }, { status: 201 });
}
