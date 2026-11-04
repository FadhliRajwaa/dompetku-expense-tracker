import { test, expect } from '@playwright/test';

test('tanpa login ke dashboard dialihkan ke login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/login/);
});
