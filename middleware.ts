import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PROTECTED = ['/dashboard', '/transaksi', '/dompet', '/anggaran', '/laporan', '/pengaturan', '/lainnya'];
const AUTH_PAGES = ['/login', '/register'];

// RINGAN untuk Edge (limit 1MB plan gratis): hanya verifikasi JWT via
// next-auth/jwt — TIDAK mengimpor Prisma/bcrypt. Cek data cukup di API.
//
// Di https Auth.js memakai cookie `__Secure-authjs.session-token` DAN nama itu
// sebagai salt HKDF. getToken() tanpa `secureCookie` selalu membaca varian
// non-secure, sehingga dekripsi gagal dan setiap login (Google maupun
// credentials) langsung dipantulkan balik ke /login. Deteksi https disamakan
// dengan @auth/core (url.protocol === 'https:'), dengan cadangan x-forwarded-proto.
async function getSessionToken(req: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  const isHttps = proto === 'https' || req.nextUrl.protocol === 'https:';
  const token = await getToken({ req, secret, secureCookie: isHttps });
  if (token) return token;
  // Cadangan: bila deteksi protokol meleset, coba varian satunya.
  return await getToken({ req, secret, secureCookie: !isHttps });
}

export async function middleware(req: NextRequest) {
  const token = await getSessionToken(req);
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
