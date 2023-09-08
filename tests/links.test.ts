import { expect, test } from '@playwright/test'

test('Links page', async ({ page }) => {
	await page.goto('http://localhost:4173/links')

	const title = await page.textContent('h1')
	expect(title).toBe('Short URLs with SvelteKit')

	const visibleLinks = await page.$$('ul li')
	expect(visibleLinks.length).toBeGreaterThan(0)

	const firstSourceLink = await visibleLinks[0].$('p:nth-child(2) a')
	const firstDestinationLink = await visibleLinks[0].$(
		'p:nth-child(3) a'
	)

	const destinationHref = await firstDestinationLink?.getAttribute(
		'href'
	)

	if (destinationHref) {
		const actualDestination = 'https://ten-facts.vercel.app/' // Replace with the actual URL if it redirects
		// Start waiting for the URL change before clicking
		const navigationPromise = page.waitForURL(actualDestination, {
			timeout: 60000,
		})

		await firstSourceLink?.click()

		// Wait for the URL change
		await navigationPromise

		const destinationURL = page.url()
		expect(destinationURL).toBe(actualDestination)
	} else {
		throw new Error('Destination URL not found.')
	}
})
