import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const q = new URL(req.nextUrl).searchParams;
  const month = Math.min(12, Math.max(1, Number(q.get('month') ?? new Date().getMonth() + 1)));
  const year = Number(q.get('year') ?? new Date().getFullYear());
  const data = await getDashboardData({ userId: (session.user as { id: string }).id, month, year });
  return NextResponse.json({ data });
}
