import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const q = req.nextUrl.searchParams;
  const limit = Math.min(200, Math.max(1, Number(q.get('limit') ?? 50)));
  const entity = q.get('entity');

  const data = await db.auditLog.findMany({
    where: { userId, ...(entity ? { entity } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ data });
}
