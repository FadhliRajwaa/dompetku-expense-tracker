export function formatIDR(n: number | string): string {
  const v = typeof n === 'string' ? Number(n) : n;
  const abs = Math.abs(v).toLocaleString('id-ID');
  return v < 0 ? `-Rp ${abs}` : `Rp ${abs}`;
}
