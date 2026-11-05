'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';
import { Check, ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import { useDebouncedValue } from '@/lib/use-debounced';
import { toast } from '@/components/ui/toast';

export interface SelectOption {
  value: string;
  label: string;
  /** Baris kedua opsional — dipakai untuk nama dompet + saldo, dsb. */
  hint?: string;
  /** Ikon material-symbols; diabaikan bila tidak ada. */
  icon?: string;
  /** Titik warna kecil di kiri. */
  color?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
  /** Tinggi kontrol. `lg` dipakai di form utama, `sm` di filter. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label'?: string;
  /**
   * Kolom pencarian di dalam popup. `'auto'` (default) menampilkannya hanya
   * bila pilihan cukup banyak untuk membuat scroll terasa — menu 3 item tidak
   * perlu kotak cari.
   */
  searchable?: boolean | 'auto';
  /**
   * Bila diisi, popup menawarkan pembuatan item baru saat tidak ada hasil yang
   * cocok. Mengembalikan opsi yang berhasil dibuat (atau `null` bila gagal)
   * supaya Select bisa langsung memilihnya.
   */
  onCreate?: (query: string) => Promise<SelectOption | null>;
  /** Label tombol tambah, mis. "Tambah kategori". */
  createLabel?: string;
  /** Teks saat tidak ada hasil. */
  emptyText?: string;
}

const SIZES = {
  sm: 'h-9 text-[12.5px] px-3',
  md: 'h-11 text-[13.5px] px-3.5',
  lg: 'h-12 text-[14.5px] px-4',
} as const;

/** Ambang jumlah opsi untuk mengaktifkan pencarian otomatis. */
const SEARCH_THRESHOLD = 7;

/**
 * Select premium.
 *
 * Dibangun di atas Base UI Popover, bukan `<select>` native, supaya:
 *  - highlight aktif dan item terpilih punya state visual sendiri;
 *  - bisa menampilkan hint dua baris dan titik warna;
 *  - posisi popup dibalik otomatis bila ruang bawah habis;
 *  - tetap dapat dioperasikan penuh lewat keyboard (sesuai ARIA listbox).
 *
 * Dua hal yang harus dijaga:
 *  1. Setiap area yang bisa di-scroll diberi `data-lenis-prevent`. Smooth scroll
 *     global (Lenis) memanggil `preventDefault()` pada wheel; tanpa atribut ini
 *     daftar panjang tidak bisa digulir sama sekali.
 *  2. Item aktif digulir dengan mengubah `scrollTop` kontainer, bukan
 *     `scrollIntoView()` — yang terakhir ikut menggeser halaman di belakang.
 */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Pilih…',
  id,
  className,
  size = 'md',
  disabled,
  searchable = 'auto',
  onCreate,
  createLabel = 'Tambah',
  emptyText = 'Tidak ada pilihan',
  ...aria
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [query, setQuery] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState('');

  const listRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const showSearch = searchable === true || (searchable === 'auto' && options.length > SEARCH_THRESHOLD);

  // Debaunced: mengetik cepat tidak memicu penyaringan ulang di setiap ketukan.
  const debouncedQuery = useDebouncedValue(query, 200);
  const needle = debouncedQuery.trim().toLocaleLowerCase('id-ID');

  const filtered = React.useMemo(() => {
    if (!needle) return options;
    return options.filter(
      (o) =>
        o.label.toLocaleLowerCase('id-ID').includes(needle) ||
        o.hint?.toLocaleLowerCase('id-ID').includes(needle),
    );
  }, [options, needle]);

  // Indeks awal mengikuti nilai terpilih setiap popup dibuka.
  React.useEffect(() => {
    if (!open) return;
    const i = options.findIndex((o) => o.value === value);
    setActive(i >= 0 ? i : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Kembalikan pencarian saat popup ditutup agar pembukaan berikutnya bersih.
  React.useEffect(() => {
    if (open) return;
    setQuery('');
    setCreateError('');
  }, [open]);

  // Saat hasil menyusut, indeks aktif bisa menunjuk ke luar daftar.
  React.useEffect(() => {
    setActive((i) => (i >= filtered.length ? 0 : i));
  }, [filtered.length]);

  // Kata kunci baru selalu mulai dari hasil teratas.
  React.useEffect(() => {
    if (needle) setActive(0);
  }, [needle]);

  // Gulirkan item aktif di dalam kontainer saja.
  React.useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const node = list?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (!list || !node) return;
    const top = node.offsetTop;
    const bottom = top + node.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top - 4;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight + 4;
  }, [active, open]);

  const commit = (idx: number) => {
    const opt = filtered[idx];
    if (!opt || opt.disabled) return;
    onValueChange(opt.value);
    setOpen(false);
  };

  async function create() {
    const name = query.trim();
    if (!name || !onCreate || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      const created = await onCreate(name);
      if (!created) return;
      onValueChange(created.value);
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menambah';
      setCreateError(message);
      // Notifikasi tetap muncul walau pengguna mungkin sedang melihat daftar;
      // popup bisa tertutup karena klik di luar, pesan jangan ikut hilang.
      toast.error(`${createLabel} gagal`, message);
    } finally {
      setCreating(false);
    }
  }

  const canCreate = Boolean(onCreate) && query.trim().length >= 2;
  const exactExists = filtered.some(
    (o) => o.label.trim().toLocaleLowerCase('id-ID') === needle && needle.length > 0,
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Enter di kotak cari saat tidak ada hasil = buat item baru.
      if (filtered.length === 0 && canCreate && !exactExists) void create();
      else commit(active);
    } else if (e.key === ' ' && !showSearch) {
      e.preventDefault();
      commit(active);
    } else if (e.key === 'Home' && !showSearch) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && !showSearch) {
      e.preventDefault();
      setActive(filtered.length - 1);
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger
        id={id}
        disabled={disabled}
        aria-label={aria['aria-label']}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'group flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-card text-left font-medium text-foreground shadow-xs outline-none transition-all',
          'hover:border-brand-300 focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-500/12',
          'data-[popup-open]:border-brand-400 data-[popup-open]:ring-4 data-[popup-open]:ring-brand-500/12',
          'disabled:cursor-not-allowed disabled:opacity-55',
          SIZES[size],
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected?.color && (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: selected.color }}
              aria-hidden="true"
            />
          )}
          {selected?.icon && (
            <span className="material-symbols-outlined shrink-0 text-[17px] text-muted-foreground">
              {selected.icon}
            </span>
          )}
          <span className={cn('truncate', !selected && 'text-muted-foreground/70')}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180 text-brand-500',
          )}
        />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          // Jarak aman dari tepi layar saat popup digeser agar tetap terlihat.
          // Tanpa ini, popup lebar di HP bisa menempel (atau melewati) tepi.
          collisionPadding={8}
          // Lebar popup: mengikuti label terpanjang (`w-max`) tetapi tidak
          // pernah lebih sempit dari trigger, dan tidak pernah melewati
          // viewport. Sebelumnya hanya `w-max` + max-w, sehingga popup di
          // dalam dialog HP melebar melewati tepi kiri layar karena tidak ada
          // batas bawah terhadap sisa ruang.
          //
          // `max-w-[calc(100vw-1rem)]` menjadi jaring pengaman terakhir;
          // `collisionPadding` di Positioner menjaga jarak dari tepi.
          className="isolate z-50 w-max min-w-(--anchor-width) max-w-[min(22rem,calc(100vw-1rem))]"
        >
          <PopoverPrimitive.Popup
            onKeyDown={onKeyDown}
            // Fokus otomatis ke kotak cari hanya untuk mouse/keyboard. Saat
            // dibuka lewat sentuhan, `true` memakai perilaku bawaan Base UI
            // (fokus ke popup) supaya keyboard virtual tidak langsung terbuka
            // dan menutupi separuh daftar.
            initialFocus={
              showSearch
                ? (openType) => (openType === 'touch' ? true : searchRef.current)
                : undefined
            }
            // `data-lenis-prevent` wajib: lihat catatan di atas komponen.
            data-lenis-prevent
            className={cn(
              // Tinggi popup dibatasi per breakpoint. Di HP ruang di bawah
              // trigger di dalam sheet hanya ~170px; daftar 16rem membuat Base
              // UI membalik popup ke atas dan menutupi baris tab. 12rem di HP
              // masih menampilkan 4 baris + kotak cari, sisanya digulir.
              'flex max-h-[min(12rem,var(--available-height))] flex-col overflow-hidden rounded-2xl border border-border/70 bg-popover text-popover-foreground shadow-lg sm:max-h-[min(16rem,var(--available-height))]',
              'origin-(--transform-origin) outline-none',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
              'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            )}
          >
            {showSearch && (
              <div className="relative shrink-0 border-b border-border/60 p-2">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/70"
                />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari…"
                  aria-label={`Cari ${aria['aria-label'] ?? 'pilihan'}`}
                  className="h-9 w-full rounded-lg border border-transparent bg-muted/60 pl-8 pr-2.5 text-[13px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand-300 focus:bg-card"
                />
              </div>
            )}

            <div
              ref={listRef}
              role="listbox"
              aria-label={aria['aria-label']}
              data-lenis-prevent
              // `min-h-0` agar flex child ini benar-benar bisa menyusut dan
              // memunculkan scrollbar; tanpa itu daftar panjang meluber keluar.
              // `max-h` eksplisit: `flex-1` saja tidak membatasi bila popup
              // tidak punya tinggi tetap dan `--available-height` tak terbaca.
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5"
            >
              {filtered.length === 0 && (
                <p className="px-3 py-5 text-center text-[12.5px] text-muted-foreground">
                  {needle ? `Tidak ada hasil untuk “${debouncedQuery.trim()}”` : emptyText}
                </p>
              )}
              {filtered.map((o, i) => {
                const isSel = o.value === value;
                const isActive = i === active;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    data-idx={i}
                    disabled={o.disabled}
                    // MouseEnter (bukan pointermove) agar tidak membanjiri state saat scroll.
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(i)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors',
                      'disabled:pointer-events-none disabled:opacity-40',
                      isActive && !isSel && 'bg-muted',
                      isSel && 'bg-brand-50 dark:bg-brand-900/40',
                    )}
                  >
                    {o.color && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: o.color }}
                        aria-hidden="true"
                      />
                    )}
                    {o.icon && (
                      <span
                        className={cn(
                          'material-symbols-outlined shrink-0 text-[18px]',
                          isSel ? 'text-brand-600' : 'text-muted-foreground',
                        )}
                      >
                        {o.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block whitespace-nowrap text-[13.5px]',
                          isSel ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-medium',
                        )}
                      >
                        {o.label}
                      </span>
                      {o.hint && (
                        <span className="block whitespace-nowrap text-[11px] text-muted-foreground">
                          {o.hint}
                        </span>
                      )}
                    </span>
                    {isSel && <Check className="size-4 shrink-0 text-brand-600" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {canCreate && !exactExists && (
              <div className="shrink-0 border-t border-border/60 p-1.5">
                <button
                  type="button"
                  onClick={create}
                  disabled={creating}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60 dark:text-brand-300 dark:hover:bg-brand-900/40"
                >
                  {creating ? (
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {createLabel} “{query.trim()}”
                  </span>
                </button>
              </div>
            )}

            {createError && (
              <p
                role="alert"
                className="shrink-0 border-t border-border/60 px-3 py-2 text-[11.5px] font-medium text-rose-600 dark:text-rose-400"
              >
                {createError}
              </p>
            )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
