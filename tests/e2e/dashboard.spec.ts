import { test, expect } from '@playwright/test';

test('dashboard butuh login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});

test('halaman auth tampil', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /^masuk$/i })).toBeVisible();
  await page.goto('/register');
  await expect(page.getByRole('button', { name: /^daftar gratis$/i })).toBeVisible();
});
