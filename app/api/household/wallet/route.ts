import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { writeAudit } from '@/lib/audit';
import { readJson, rateLimit, rateLimitedResponse } from '@/lib/rate-limit';

const schema = z.object({
  walletId: z.string().cuid(),
  shared: z.boolean(),
});

/**
 * Bagikan / tarik dompet dari rumah tangga.
 *
 * Hanya PEMILIK dompet yang boleh membagikannya. Dompet yang dibagikan tetap
 * milik `userId` aslinya — rumah tangga hanya memberi akses baca/tulis kepada
 * anggota lain. Menarik kembali tidak menghapus transaksi apa pun.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  if (!rateLimit(req, `household:wallet:${userId}`, 30, 60_000)) return rateLimitedResponse();

  const body = await readJson<unknown>(req);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: 400 });

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const wallet = await db.wallet.findFirst({ where: { id: parsed.data.walletId, userId } });
  if (!wallet) return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });

  const membership = await db.membership.findFirst({ where: { userId } });
  if (!membership) {
    return NextResponse.json({ error: 'Kamu belum tergabung dalam rumah tangga' }, { status: 400 });
  }

  const updated = await db.wallet.update({
    where: { id: wallet.id },
    data: { householdId: parsed.data.shared ? membership.householdId : null },
  });

  await writeAudit({
    userId,
    action: parsed.data.shared ? 'household.wallet.link' : 'household.wallet.unlink',
    entity: 'Wallet',
    entityId: wallet.id,
    summary: wallet.name,
  });

  return NextResponse.json({ data: { id: updated.id, householdId: updated.householdId } });
}
