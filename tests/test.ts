import { expect, test } from '@playwright/test'

test('index page has expected h1', async ({ page }) => {
	await page.goto('/links')
	expect(await page.textContent('h1')).toBe(
		'Short URLs with SvelteKit'
	)
})
