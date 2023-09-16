import { expect, test } from '@playwright/test'

// Test: Check sorting toggle button is visible
test('should display sorting toggle button', async ({ page }) => {
	await page.goto('http://localhost:4173/links')
	const sortButton = await page.$('button')
	expect(await sortButton?.isVisible()).toBe(true)
})

// Test: Check initial records order
test('should display records sorted by clicks in descending order initially', async ({
	page,
}) => {
	await page.goto('http://localhost:4173/links')
	const clicksElements = await page.$$eval(
		'ul li p:nth-child(2)',
		(elements) =>
			elements.map((e) =>
				parseInt(e.textContent?.split(': ')[1] || '0')
			)
	)
	const isDescending = clicksElements.every(
		(val, i, arr) => !i || arr[i - 1] >= val
	)
	expect(isDescending).toBe(true)
})

// For this test, you would need to add some way to toggle the sort order and re-fetch the sorted records
// Test: Check toggled records order
test('should display records sorted by clicks in ascending order when toggled', async ({
	page,
}) => {
	await page.goto('http://localhost:4173/links')
	// Simulate a click on the sorting toggle button (assuming it's the first button on the page)
	await page.click('button')

	// Wait a bit for the page to re-render (this would ideally be replaced by a more deterministic wait)
	await page.waitForTimeout(500)

	const clicksElements = await page.$$eval(
		'ul li p:nth-child(2)',
		(elements) =>
			elements.map((e) =>
				parseInt(e.textContent?.split(': ')[1] || '0')
			)
	)
	const isAscending = clicksElements.every(
		(val, i, arr) => !i || arr[i - 1] <= val
	)
	expect(isAscending).toBe(true)
})
