<script context="module">
  import { shortUrls } from '$lib/short-urls'

  export const load = async ({ url }) => {
    const { redirects } = shortUrls

    let [redirect] = redirects.filter(
      item => item.source === url.pathname
    )
    if (!redirect) redirect = { destination: `/` }

    return {
      status: 301,
      redirect: redirect.destination,
    }
  }
</script>
