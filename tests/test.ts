import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/links');
	await expect(
		page.getByRole('heading', { name: 'Short URLs with SvelteKit' })
	).toBeVisible();
});
