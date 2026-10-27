import { expect, test } from '@playwright/test';

const clicks = (page: import('@playwright/test').Page) =>
	page
		.locator('.clicks[data-clicks]')
		.evaluateAll((elements) =>
			elements.map((element) =>
				Number(element.getAttribute('data-clicks')),
			),
		);

test('shows the sort controls', async ({ page }) => {
	await page.goto('/links');
	await expect(
		page.getByRole('button', { name: 'Most clicked' }),
	).toHaveAttribute('aria-pressed', 'true');
	await expect(
		page.getByRole('button', { name: 'A to Z' }),
	).toBeVisible();
});

test('sorts links by most clicked first', async ({ page }) => {
	await page.goto('/links');
	const values = await clicks(page);
	expect(
		values.every((value, i) => !i || values[i - 1] >= value),
	).toBe(true);
});

test('sorts links A to Z when chosen', async ({ page }) => {
	await page.goto('/links');
	await page.getByRole('button', { name: 'A to Z' }).click();
	await expect(
		page.getByRole('button', { name: 'A to Z' }),
	).toHaveAttribute('aria-pressed', 'true');
	const sources = await page.locator('.source').allTextContents();
	expect(sources).toEqual(
		[...sources].sort((a, b) => a.localeCompare(b)),
	);
});
