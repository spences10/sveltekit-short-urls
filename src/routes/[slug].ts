import { shortUrls } from '$lib/short-urls'

export const get = async ({ url }) => {
  const { redirects } = shortUrls

  const [redirect] = redirects.filter(
    item => item.source === url.pathname
  )

  if (redirect) {
    return {
      headers: { Location: redirect.destination },
      status: 301,
    }
  } else return {}
}
