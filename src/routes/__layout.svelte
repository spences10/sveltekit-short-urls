<script lang="ts" context="module">
  import { shortUrls } from '$lib/short-urls'

  export const load = async ({ url }) => {
    const { redirects } = shortUrls

    let [redirect] = redirects.filter(
      item => item.source === url.pathname
    )

    if (redirect) {
      return {
        status: 301,
        redirect: redirect.destination,
      }
    } else return {}
  }
</script>

<slot />
