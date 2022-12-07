import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ url: { pathname } }) => {
	if (pathname === '/') {
		throw redirect(302, 'https://scottspence.com')
	}
}
