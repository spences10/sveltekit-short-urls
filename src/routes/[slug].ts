import { shortUrls } from '$lib/short-urls'
import type { RequestHandler } from '@sveltejs/kit'

export const get: RequestHandler = async ({ url }) => {
  const { redirects } = shortUrls

  const [redirect] = redirects.filter(
    item => item.source === url.pathname
  )

  if (redirect) {
    return {
      headers: { Location: redirect.destination },
      status: 302,
    }
  } else if (!redirect && url.pathname.length > 1) {
    return {
      headers: { Location: '/' },
      status: 302,
    }
  } else return {}
}
