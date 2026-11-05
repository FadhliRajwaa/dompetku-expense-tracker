import type { SelectOption } from '@/components/ui/select-premium';

/**
 * Membuat kategori baru dari dalam dropdown, lalu mengembalikannya sebagai opsi
 * siap-pilih. Dipakai oleh `Select.onCreate` di formulir transaksi, anggaran,
 * dan transaksi berulang.
 *
 * Kalau API menolak karena nama sudah ada (409), kategori yang sudah ada tidak
 * dikembalikan oleh server — jadi pesannya diteruskan apa adanya supaya
 * pengguna memilih dari daftar, bukan mengira penyimpanan gagal tanpa sebab.
 */
export async function createCategory(
  name: string,
  type: 'INCOME' | 'EXPENSE',
): Promise<SelectOption> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), type }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: { id: string; name: string };
    error?: string;
  };
  if (!res.ok || !json.data) {
    // Pesan diteruskan ke pemanggil; Select yang memunculkan toast dan pesan
    // inline, sehingga tidak ada pelaporan ganda di dua lapisan sekaligus.
    throw new Error(json.error ?? 'Gagal menambah kategori');
  }
  return { value: json.data.id, label: json.data.name };
}
