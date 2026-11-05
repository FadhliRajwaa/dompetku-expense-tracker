'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select-premium';
import { FieldError, FieldLabel, MoneyInput } from '@/components/ui/money-input';
import { createCategory } from '@/lib/categories-client';

export function BudgetForm({
  categories: initialCategories,
  month,
  year,
}: {
  categories: { id: string; name: string }[];
  month: number;
  year: number;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(initialCategories[0]?.id ?? '');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const [limitError, setLimitError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setError('');
    if (!(Number(limit) > 0)) {
      setLimitError('Batas anggaran harus lebih dari nol.');
      return;
    }
    setLimitError('');
    if (!categoryId) {
      setError('Pilih kategori dulu.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, month, year, limit: Number(limit) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Gagal menyimpan anggaran.');
        return;
      }
      setOpen(false);
      setLimit('');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  }

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  /** Anggaran hanya untuk kategori pengeluaran. */
  async function onCreateCategory(name: string) {
    const created = await createCategory(name, 'EXPENSE');
    const opt = { id: created.value, name: created.label };
    setCategories((prev) => [...prev, opt]);
    setCategoryId(opt.id);
    return created;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-9 gap-1.5 rounded-xl bg-brand-500 px-3.5 text-[12.5px] font-semibold text-white hover:bg-brand-600">
            <Plus className="size-4" aria-hidden="true" />
            Tambah anggaran
          </Button>
        }
      />
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-display text-[1.35rem]">Tambah anggaran</DialogTitle>
          <p className="text-[12.5px] text-muted-foreground">
            Berlaku untuk <span className="font-semibold text-foreground">{monthName}</span>. Batas
            diulang tiap bulan hanya bila kamu menambahkannya lagi.
          </p>
        </DialogHeader>

        <DialogBody>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Kategori</FieldLabel>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Pilih kategori"
              aria-label="Kategori anggaran"
              searchable
              onCreate={onCreateCategory}
              createLabel="Tambah kategori"
              emptyText="Belum ada kategori pengeluaran"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor="b-limit">Batas per bulan</FieldLabel>
            <MoneyInput
              id="b-limit"
              value={limit}
              onChange={(v) => {
                setLimit(v);
                setLimitError('');
              }}
              placeholder="0"
              invalid={Boolean(limitError)}
            />
            <FieldError message={limitError} />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            >
              {error}
            </p>
          )}

          <DialogActions>
            <Button
              onClick={save}
              disabled={saving}
              className="h-11 w-full rounded-xl bg-brand-500 text-[13.5px] font-bold text-white hover:bg-brand-600"
            >
              {saving ? 'Menyimpan…' : 'Simpan anggaran'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
