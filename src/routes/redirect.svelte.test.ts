import * as kit from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { load } from './+page';

// Mock the redirect function using vi.fn() for correct typing
vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn(),
}));

describe('Page Load', () => {
	it('should redirect to "https://scottspence.com" if pathname is "/"', async () => {
		// Access the mocked redirect function and type it correctly
		// @ts-ignore
		const mocked_redirect = kit.redirect as unknown as vi.Mock;

		// Reset the mock to clear any previous calls
		mocked_redirect.mockReset();

		// Call the load function with a mocked argument
		await load({ url: { pathname: '/' } });

		// Check if redirect was called correctly
		expect(mocked_redirect).toHaveBeenCalledWith(
			302,
			'https://scottspence.com',
		);
	});

	it.skip('should not redirect if pathname is not "/"', async () => {
		// Access the mocked redirect function and ensure it's correctly typed as a mock
		// @ts-ignore
		const mocked_redirect = kit.redirect as unknown as vi.Mock;
		mocked_redirect.mockReset();

		await load({ url: { pathname: '/about' } });

		// Check if redirect was not called
		expect(mocked_redirect).not.toHaveBeenCalled();
	});
});
