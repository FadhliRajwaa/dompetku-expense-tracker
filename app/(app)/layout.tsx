import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  const userId = (session.user as { id: string }).id;
  const wallets = await db.wallet.findMany({ where: { userId, isActive: true } });
  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);
  return (
    <AppShell user={{ name: session.user.name ?? 'Pengguna', email: session.user.email ?? '' }} totalBalance={totalBalance}>
      {children}
    </AppShell>
  );
}
