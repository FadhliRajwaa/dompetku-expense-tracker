'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from 'cn';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select } from '@/components/ui/select-premium';
import { DatePicker, toISODate } from '@/components/ui/date-picker';
import { formatIDR } from '@/lib/format';
import { createCategory } from '@/lib/categories-client';
import { requestJson } from '@/components/ui/toast';

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

interface Wallet {
  id: string;
  name: string;
  balance: string;
}
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

const CURRENCIES = ['IDR', 'USD', 'EUR', 'SGD', 'MYR'];
const CHIPS = [10_000, 50_000, 100_000, 500_000];

type Tab = 'EXPENSE' | 'INCOME' | 'TRANSFER';

const TABS: { key: Tab; label: string; icon: typeof ArrowUpRight }[] = [
  { key: 'EXPENSE', label: 'Pengeluaran', icon: ArrowUpRight },
  { key: 'INCOME', label: 'Pemasukan', icon: ArrowDownLeft },
  { key: 'TRANSFER', label: 'Transfer', icon: ArrowLeftRight },
];

/**
 * Lembar catat cepat.
 *
 * Semua kontrol memakai komponen premium (bukan `<select>` / `<input type=date>`
 * native) agar tampilannya konsisten dengan sisa aplikasi di desktop maupun HP.
 * Nominal diformat ribuan saat diketik supaya angka panjang tetap terbaca.
 */
export function QuickAddSheet({ open, onOpenChange, onSaved }: QuickAddSheetProps) {
  const [tab, setTab] = useState<Tab>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState('IDR');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoadingWallets(true);
    (async () => {
      try {
        const [w, c] = await Promise.all([
          fetch('/api/wallets').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
        ]);
        const ws: Wallet[] = w.data ?? [];
        setWallets(ws);
        setCategories(c.data ?? []);
        setWalletId((prev) => prev || ws[0]?.id || '');
      } catch {
        setError('Gagal memuat data. Periksa koneksimu.');
      } finally {
        setLoadingWallets(false);
      }
    })();
  }, [open]);

  const filteredCats = useMemo(
    () => categories.filter((c) => c.type === (tab === 'TRANSFER' ? 'EXPENSE' : tab)),
    [categories, tab],
  );

  // Kategori bisa berubah saat tab diganti; jangan biarkan nilai lama tertinggal.
  useEffect(() => {
    if (tab === 'TRANSFER') return;
    if (categoryId && filteredCats.some((c) => c.id === categoryId)) return;
    setCategoryId(filteredCats[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filteredCats]);

  const numericAmount = Number(amount.replace(/\./g, '')) || 0;

  /**
   * Tambah kategori langsung dari dropdown. Hasilnya disisipkan ke state lokal
   * agar langsung muncul di daftar tanpa menunggu muat ulang server.
   */
  async function onCreateCategory(name: string) {
    const catType = tab === 'TRANSFER' ? 'EXPENSE' : tab;
    const created = await createCategory(name, catType);
    setCategories((prev) => [...prev, { id: created.value, name: created.label, type: catType }]);
    setCategoryId(created.value);
    return created;
  }

  function onAmountChange(raw: string) {
    // Hanya digit; titik ribuan ditambahkan ulang untuk tampilan.
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    setAmount(digits ? Number(digits).toLocaleString('id-ID') : '');
    setError('');
  }

  function addChip(v: number) {
    const next = numericAmount + v;
    setAmount(next ? next.toLocaleString('id-ID') : '');
    setError('');
  }

  async function save() {
    setError('');
    if (numericAmount <= 0) {
      setError('Nominal harus lebih dari nol.');
      return;
    }
    if (!walletId) {
      setError(
        wallets.length === 0
          ? 'Kamu belum punya dompet. Buat dompet dulu di menu Dompet.'
          : 'Pilih dompet dulu.',
      );
      return;
    }
    if (tab === 'TRANSFER') {
      if (!toWalletId) {
        setError('Pilih dompet tujuan.');
        return;
      }
      if (toWalletId === walletId) {
        setError('Dompet asal dan tujuan tidak boleh sama.');
        return;
      }
    } else if (!categoryId) {
      setError('Pilih kategori dulu.');
      return;
    }

    setSaving(true);
    try {
      // Tanggal dipilih sebagai hari lokal; simpan pada tengah hari lokal
      // agar tidak bergeser ke hari sebelumnya saat dikonversi ke UTC.
      const d = new Date(`${date}T12:00:00`);
      const result = await requestJson(
        tab === 'TRANSFER' ? '/api/transfers' : '/api/transactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            tab === 'TRANSFER'
              ? {
                  fromWalletId: walletId,
                  toWalletId,
                  amount: numericAmount,
                  date: d.toISOString(),
                }
              : {
                  walletId,
                  categoryId,
                  type: tab,
                  amount: numericAmount,
                  date: d.toISOString(),
                  note: note.trim() || undefined,
                  currency,
                },
          ),
          successTitle:
            tab === 'TRANSFER'
              ? 'Transfer tercatat'
              : tab === 'INCOME'
                ? 'Pemasukan tercatat'
                : 'Pengeluaran tercatat',
          successDescription: formatIDR(numericAmount),
          errorTitle: 'Gagal menyimpan transaksi',
          context: { tab, walletId, categoryId },
        },
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAmount('');
      setNote('');
      setDate(toISODate(new Date()));
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  const walletOptions = wallets.map((w) => ({
    value: w.id,
    label: w.name,
    hint: formatIDR(Number(w.balance)),
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Tiga lapis: kepala tetap, isi yang menggulir, kaki tetap.
          Sebelumnya seluruh sheet yang menggulir dan tombol simpan ikut
          terdorong keluar layar di HP — pengguna harus menggulir buta untuk
          menemukannya. */}
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92dvh] max-w-lg gap-0 rounded-t-3xl border-border/70 p-0"
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-4 pb-3 pr-12 pt-4">
          <SheetTitle className="text-display text-[1.3rem]">Catat transaksi</SheetTitle>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-4">
          {/* Tab */}
          <div
            role="tablist"
            aria-label="Jenis transaksi"
            className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setTab(t.key);
                    setError('');
                  }}
                  className={cn(
                    'flex h-10 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-all',
                    active
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Nominal */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="qa-amount" className="text-[13px] font-semibold">
                Nominal
              </label>
              {tab !== 'TRANSFER' && (
                <div className="w-[92px]">
                  <Select
                    value={currency}
                    onValueChange={setCurrency}
                    options={CURRENCIES.map((c) => ({ value: c, label: c }))}
                    size="sm"
                    aria-label="Mata uang"
                  />
                </div>
              )}
            </div>

            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-muted-foreground">
                {currency === 'IDR' ? 'Rp' : currency}
              </span>
              <input
                id="qa-amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0"
                aria-describedby={error ? 'qa-error' : undefined}
                className={cn(
                  'numeral h-16 w-full rounded-xl border bg-card pl-14 pr-4 text-right text-[1.75rem] leading-none outline-none transition-all',
                  'placeholder:text-muted-foreground/40 focus:ring-4',
                  error && numericAmount <= 0
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/12'
                    : 'border-input focus:border-brand-400 focus:ring-brand-500/12',
                )}
              />
            </div>

            {currency !== 'IDR' && tab !== 'TRANSFER' && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Dikonversi ke Rupiah oleh server memakai kurs terkini.
              </p>
            )}

            <div className="mt-2 flex gap-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => addChip(c)}
                  className="h-8 flex-1 rounded-lg border border-border bg-card text-[11.5px] font-semibold text-muted-foreground transition-colors hover:border-brand-300 hover:text-foreground"
                >
                  +{c >= 1000 ? `${c / 1000}rb` : c}
                </button>
              ))}
            </div>
          </div>

          {/* Dompet kosong = jalan buntu. Jelaskan dan beri jalan keluarnya,
              jangan biarkan dropdown kosong tanpa sebab yang terlihat. */}
          {!loadingWallets && wallets.length === 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
              <span aria-hidden="true" className="mt-px">
                •
              </span>
              <span>
                Kamu belum punya dompet. Transaksi harus punya dompet sebagai sumber dana.{' '}
                <a href="/dompet" className="font-bold underline underline-offset-2">
                  Buat dompet dulu
                </a>
                .
              </span>
            </div>
          )}

          {/* Dompet & kategori */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qa-wallet" className="text-[13px] font-semibold">
                {tab === 'TRANSFER' ? 'Dari dompet' : 'Dompet'}
              </label>
              <div className="mt-1.5">
                <Select
                  id="qa-wallet"
                  value={walletId}
                  onValueChange={setWalletId}
                  options={walletOptions}
                  placeholder="Pilih dompet"
                  aria-label={tab === 'TRANSFER' ? 'Dari dompet' : 'Dompet'}
                />
              </div>
            </div>

            {tab === 'TRANSFER' ? (
              <div>
                <label htmlFor="qa-to" className="text-[13px] font-semibold">
                  Ke dompet
                </label>
                <div className="mt-1.5">
                  <Select
                    id="qa-to"
                    value={toWalletId}
                    onValueChange={setToWalletId}
                    options={walletOptions.filter((w) => w.value !== walletId)}
                    placeholder="Pilih tujuan"
                    aria-label="Ke dompet"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="qa-cat" className="text-[13px] font-semibold">
                  Kategori
                </label>
                <div className="mt-1.5">
                  <Select
                    id="qa-cat"
                    value={categoryId}
                    onValueChange={setCategoryId}
                    options={filteredCats.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Pilih kategori"
                    aria-label="Kategori"
                    searchable
                    onCreate={onCreateCategory}
                    createLabel="Tambah kategori"
                    emptyText="Belum ada kategori"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tanggal */}
          <div>
            <label htmlFor="qa-date" className="text-[13px] font-semibold">
              Tanggal
            </label>
            <div className="mt-1.5">
              <DatePicker id="qa-date" value={date} onChange={setDate} size="md" />
            </div>
          </div>

          {tab !== 'TRANSFER' && (
            <div>
              <label htmlFor="qa-note" className="text-[13px] font-semibold">
                Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
              </label>
              <input
                id="qa-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="cth: makan siang"
                maxLength={200}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-[13.5px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
              />
            </div>
          )}

          {error && (
            <p
              id="qa-error"
              role="alert"
              className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <span aria-hidden="true">•</span>
              {error}
            </p>
          )}
        </div>

        {/* Kaki tetap: tombol simpan selalu terlihat, tidak ikut tergulir. */}
        <div
          className="shrink-0 border-t border-border/60 bg-popover px-4 pb-4 pt-3"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 text-[14.5px] font-bold text-white shadow-sm transition-all hover:bg-brand-600 active:translate-y-px disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                Menyimpan…
              </>
            ) : (
              <>
                <Check className="size-4" aria-hidden="true" />
                Simpan transaksi
              </>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
