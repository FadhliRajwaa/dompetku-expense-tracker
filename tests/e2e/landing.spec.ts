import { test, expect } from '@playwright/test';

test('landing tampil + CTA ke register', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /uangmu punya cerita/i })).toBeVisible();
  await page.getByRole('link', { name: /mulai gratis/i }).first().click();
  await expect(page).toHaveURL(/register/);
});
