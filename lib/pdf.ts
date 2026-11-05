import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export interface PdfRow {
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  wallet: string;
  note: string;
  amount: number;
}

export interface PdfSummary {
  title: string;
  period: string;
  owner: string;
  income: number;
  expense: number;
  perCategory: { name: string; total: number }[];
}

const A4: [number, number] = [595.28, 841.89];
const M = 48; // margin
const GREEN = rgb(0.184, 0.627, 0.518); // #2FA084
const INK = rgb(0.13, 0.17, 0.16);
const MUTED = rgb(0.45, 0.48, 0.47);
const RED = rgb(0.79, 0.27, 0.31);
const LINE = rgb(0.88, 0.89, 0.89);

function money(n: number) {
  const neg = n < 0;
  const s = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.abs(n));
  return `${neg ? '-' : ''}Rp ${s}`;
}

/** Potong teks agar tidak melewati lebar maksimum (WinAnsi tidak punya ellipsis). */
function fit(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && font.widthOfTextAtSize(out + '...', size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + '...';
}

/** Hapus karakter di luar cakupan WinAnsi agar encode tidak error. */
function safe(text: string) {
  return text.replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

/**
 * Bangun PDF laporan keuangan.
 * Sengaja memakai pdf-lib (bukan Chromium) agar ringan & aman di serverless.
 */
export async function buildReportPdf(summary: PdfSummary, rows: PdfRow[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(summary.title);
  doc.setAuthor('DompetKu');
  doc.setCreator('DompetKu — pencatatan keuangan personal');

  let page: PDFPage = doc.addPage(A4);
  let y = A4[1] - M;

  const width = A4[0] - M * 2;

  const header = (p: PDFPage) => {
    p.drawRectangle({ x: 0, y: A4[1] - 8, width: A4[0], height: 8, color: GREEN });
  };
  header(page);

  // ---------- Judul ----------
  page.drawText('DompetKu', { x: M, y, size: 11, font: bold, color: GREEN });
  y -= 26;
  page.drawText(safe(summary.title), { x: M, y, size: 22, font: bold, color: INK });
  y -= 20;
  page.drawText(safe(`${summary.period}  ·  ${summary.owner}`), {
    x: M,
    y,
    size: 10,
    font: regular,
    color: MUTED,
  });
  y -= 28;

  // ---------- Ringkasan ----------
  const boxW = (width - 16) / 3;
  const cards: [string, string, boolean][] = [
    ['Pemasukan', money(summary.income), false],
    ['Pengeluaran', money(summary.expense), false],
    ['Selisih', money(summary.income - summary.expense), true],
  ];
  cards.forEach(([label, value, highlight], i) => {
    const x = M + i * (boxW + 8);
    page.drawRectangle({
      x,
      y: y - 54,
      width: boxW,
      height: 54,
      color: highlight ? rgb(0.97, 0.99, 0.98) : rgb(0.98, 0.985, 0.983),
      borderColor: LINE,
      borderWidth: 0.8,
    });
    page.drawText(label.toUpperCase(), { x: x + 10, y: y - 18, size: 7.5, font: bold, color: MUTED });
    page.drawText(safe(value), {
      x: x + 10,
      y: y - 40,
      size: 13,
      font: bold,
      color: highlight ? GREEN : INK,
    });
  });
  y -= 74;

  // ---------- Komposisi kategori ----------
  if (summary.perCategory.length) {
    page.drawText('Komposisi pengeluaran', { x: M, y, size: 11, font: bold, color: INK });
    y -= 16;
    const totalCat = summary.perCategory.reduce((s, c) => s + c.total, 0) || 1;
    for (const c of summary.perCategory.slice(0, 8)) {
      const pct = (c.total / totalCat) * 100;
      page.drawText(safe(fit(c.name, regular, 9, width * 0.45)), { x: M, y, size: 9, font: regular, color: INK });
      page.drawText(money(c.total), { x: M + width - 140, y, size: 9, font: regular, color: INK });
      page.drawText(`${pct.toFixed(1)}%`, { x: M + width - 42, y, size: 9, font: regular, color: MUTED });
      // bar tipis
      const barW = width - 200;
      page.drawRectangle({ x: M, y: y - 5, width: barW, height: 2.5, color: rgb(0.94, 0.95, 0.95) });
      page.drawRectangle({
        x: M,
        y: y - 5,
        width: Math.max(1, (barW * pct) / 100),
        height: 2.5,
        color: GREEN,
      });
      y -= 20;
    }
    y -= 8;
  }

  // ---------- Tabel transaksi ----------
  page.drawText('Rincian transaksi', { x: M, y, size: 11, font: bold, color: INK });
  y -= 18;

  const colDate = M;
  const colNote = M + 62;
  const colCat = M + 278;
  const colWallet = M + 360;
  const colAmount = M + width;

  const drawTableHead = (p: PDFPage, yy: number) => {
    p.drawRectangle({ x: M, y: yy - 6, width, height: 18, color: rgb(0.96, 0.975, 0.97) });
    p.drawText('Tanggal', { x: colDate + 2, y: yy, size: 7.5, font: bold, color: MUTED });
    p.drawText('Keterangan', { x: colNote, y: yy, size: 7.5, font: bold, color: MUTED });
    p.drawText('Kategori', { x: colCat, y: yy, size: 7.5, font: bold, color: MUTED });
    p.drawText('Dompet', { x: colWallet, y: yy, size: 7.5, font: bold, color: MUTED });
    const amt = 'Nominal';
    p.drawText(amt, {
      x: colAmount - bold.widthOfTextAtSize(amt, 7.5) - 2,
      y: yy,
      size: 7.5,
      font: bold,
      color: MUTED,
    });
    return yy - 22;
  };

  y = drawTableHead(page, y);

  for (const r of rows) {
    if (y < M + 40) {
      page = doc.addPage(A4);
      header(page);
      y = A4[1] - M - 20;
      page.drawText('DompetKu — lanjutan', { x: M, y: y + 26, size: 8, font: regular, color: MUTED });
      y = drawTableHead(page, y);
    }

    const income = r.type === 'INCOME';
    page.drawText(r.date, { x: colDate + 2, y, size: 8, font: regular, color: MUTED });
    page.drawText(safe(fit(r.note || '—', regular, 8, 200)), {
      x: colNote,
      y,
      size: 8,
      font: regular,
      color: INK,
    });
    page.drawText(safe(fit(r.category, regular, 8, 76)), { x: colCat, y, size: 8, font: regular, color: MUTED });
    page.drawText(safe(fit(r.wallet, regular, 8, 80)), {
      x: colWallet,
      y,
      size: 8,
      font: regular,
      color: MUTED,
    });

    const amt = `${income ? '+' : '-'} ${money(r.amount)}`;
    page.drawText(amt, {
      x: colAmount - bold.widthOfTextAtSize(amt, 8) - 2,
      y,
      size: 8,
      font: bold,
      color: income ? GREEN : INK,
    });

    page.drawLine({
      start: { x: M, y: y - 6 },
      end: { x: M + width, y: y - 6 },
      thickness: 0.4,
      color: LINE,
    });
    y -= 18;
  }

  // ---------- Footer setiap halaman ----------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(
      safe(`Dibuat ${new Date().toLocaleString('id-ID')}  ·  DompetKu`),
      { x: M, y: 26, size: 7.5, font: regular, color: MUTED },
    );
    const label = `${i + 1} / ${pages.length}`;
    p.drawText(label, {
      x: A4[0] - M - regular.widthOfTextAtSize(label, 7.5),
      y: 26,
      size: 7.5,
      font: regular,
      color: MUTED,
    });
  });
  void RED;

  return await doc.save();
}
