<script lang="ts">
  import { shortUrls } from '$lib/short-urls'
  const { redirects } = shortUrls
</script>

<h1>Short URLs with SvelteKit</h1>

{#each redirects as redirect}
  <p>Source: {redirect.source}</p>
  <p>
    Destination: <a href={redirect.destination}>
      {redirect.destination}
    </a>
  </p>
{/each}
