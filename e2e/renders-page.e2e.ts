import { expect, test } from '@playwright/test';

test('links page shows the domain as its heading', async ({
	page,
}) => {
	await page.goto('/links');
	const { hostname } = new URL(page.url());
	await expect(
		page.getByRole('heading', { level: 1, name: hostname }),
	).toBeVisible();
});
