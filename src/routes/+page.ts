import { redirect } from '@sveltejs/kit'

export const load = async ({ url: { pathname } }) => {
  if (pathname === '/') {
    throw redirect(302, 'https://scottspence.com')
  }
}
