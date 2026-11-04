import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('smoke scaffolding', () => {
  it('alias @/* dan helper cn tersedia', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('globals.css memuat token brand hijau', () => {
    const css = readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf8');
    expect(css).toContain('--brand: #2fa084');
    expect(css).toContain('--brand-dark: #27856d');
    expect(css).toContain('--brand-tint: #d9f2e7');
  });
});
