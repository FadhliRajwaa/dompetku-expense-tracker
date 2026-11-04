import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatIDR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletForm } from '@/components/wallet-form';
import { TransferForm } from '@/components/transfer-form';

const TYPE_LABEL: Record<string, string> = { CASH: 'Tunai', BANK: 'Bank', E_WALLET: 'E-Wallet' };

export default async function DompetPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const [wallets, transfers] = await Promise.all([
    db.wallet.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'asc' } }),
    db.transfer.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 20 }),
  ]);
  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const total = wallets.reduce((s, w) => s + Number(w.balance), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Dompet & Transfer</h1>
          <p className="text-sm text-zinc-500">Total {formatIDR(total)} di {wallets.length} dompet</p>
        </div>
        <WalletForm />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {wallets.map((w) => (
          <Card key={w.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-base">{w.name}</CardTitle>
              <Badge className="bg-[#d9f2e7] text-[#1f6b4d] hover:bg-[#d9f2e7]">{TYPE_LABEL[w.type] ?? w.type}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatIDR(Number(w.balance))}</p>
            </CardContent>
          </Card>
        ))}
        {wallets.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-zinc-500">
              Belum ada dompet. Klik &quot;Tambah Dompet&quot; untuk membuat yang pertama.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Transfer Antar Dompet</CardTitle></CardHeader>
          <CardContent>
            <TransferForm wallets={wallets.map((w) => ({ id: w.id, name: w.name, balance: Number(w.balance) }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Riwayat Transfer</CardTitle></CardHeader>
          <CardContent>
            {transfers.length === 0 && <p className="text-sm text-zinc-500">Belum ada transfer.</p>}
            <ul className="divide-y">
              {transfers.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {walletMap.get(t.fromWalletId)?.name ?? '?'} → {walletMap.get(t.toWalletId)?.name ?? '?'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {t.note ? ` • ${t.note}` : ''}
                    </p>
                  </div>
                  <span className="font-bold">{formatIDR(Number(t.amount))}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
