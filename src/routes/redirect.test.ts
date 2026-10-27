import { redirect } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vite-plus/test';
import { load } from './+page';

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn(),
}));

type LoadEvent = Parameters<typeof load>[0];

const load_with_pathname = (pathname: string) =>
	load({ url: { pathname } } as LoadEvent);

describe('Page Load', () => {
	it('should redirect to "https://scottspence.com" if pathname is "/"', async () => {
		vi.mocked(redirect).mockReset();

		await load_with_pathname('/');

		expect(redirect).toHaveBeenCalledWith(
			302,
			'https://scottspence.com',
		);
	});

	it('should not redirect if pathname is not "/"', async () => {
		vi.mocked(redirect).mockReset();

		await load_with_pathname('/about');

		expect(redirect).not.toHaveBeenCalled();
	});
});
