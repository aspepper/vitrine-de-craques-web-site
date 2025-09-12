import { test, expect } from '@playwright/test';

const USER_EMAIL = 'agent1@example.com';
const USER_PASSWORD = 'password';

test('redirects to login when accessing upload while logged out', async ({ page }) => {
  await page.goto('/upload');
  await expect(page).toHaveURL(/\/login$/);
});

test('allows access to upload when logged in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(USER_EMAIL);
  await page.getByLabel('Senha').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/upload');
  await expect(page).toHaveURL('/upload');
  await expect(page.getByRole('heading', { name: 'Upload de Vídeo' })).toBeVisible();
});
