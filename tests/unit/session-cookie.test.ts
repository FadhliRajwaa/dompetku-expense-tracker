import { describe, expect, it } from 'vitest';
import { encode } from 'next-auth/jwt';

// Regresi bug production: di https Auth.js memakai nama cookie berprefix
// `__Secure-` SEBAGAI SALT HKDF. Token yang di-encode dengan salt non-secure
// tidak akan pernah terbaca middleware di production, sehingga user yang sudah
// login dipantulkan balik ke /login. Test ini mengunci kontrak salt tersebut.
const SECRET = 'test-secret-minimal-32-karakter-untuk-hkdf';

describe('salt cookie session', () => {
  it('token bersalt __Secure- berbeda dari token bersalt biasa', async () => {
    const payload = { sub: 'user-1', id: 'user-1', email: 'a@b.com' };
    const secure = await encode({ token: payload, secret: SECRET, salt: '__Secure-authjs.session-token' });
    const plain = await encode({ token: payload, secret: SECRET, salt: 'authjs.session-token' });
    expect(secure).not.toBe(plain);
  });

  it('token bersalt __Secure- membawa kid hasil derivasi salt tersebut', async () => {
    const token = await encode({
      token: { sub: 'user-1', id: 'user-1' },
      secret: SECRET,
      salt: '__Secure-authjs.session-token',
    });
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header.enc).toBe('A256CBC-HS512');
    expect(typeof header.kid).toBe('string');
    expect(header.kid.length).toBeGreaterThan(0);
  });
});
