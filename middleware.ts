import { auth } from '@/lib/auth';

const PROTECTED = ['/dashboard', '/transaksi', '/dompet', '/anggaran', '/laporan', '/pengaturan'];
const AUTH_PAGES = ['/login', '/register'];

export default auth((req) => {
  const loggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  if (loggedIn && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return Response.redirect(new URL('/dashboard', req.url));
  }
  if (!loggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
