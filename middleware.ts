import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED = ['/dashboard', '/transaksi', '/dompet', '/anggaran', '/laporan', '/pengaturan', '/lainnya'];
const AUTH_PAGES = ['/login', '/register'];

// RINGAN untuk Edge (limit 1MB plan gratis): hanya verifikasi JWT via
// next-auth/jwt — TIDAK mengimpor Prisma/bcrypt. Cek data cukup di API.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const loggedIn = !!token;
  const { pathname } = req.nextUrl;
  if (loggedIn && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  if (!loggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg|og-image.png|manifest.webmanifest).*)'] };
