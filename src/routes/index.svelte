<script lang="ts">
  import { shortUrls } from '$lib/short-urls'
  const { redirects } = shortUrls
</script>

<h1 class="text-4xl text-primary mb-7">Short URLs with SvelteKit</h1>

{#each redirects as redirect}
  <p class="text-xl mb-1">
    Source: <span class="link text-secondary">{redirect.source}</span>
  </p>
  <p class="text-xl mb-5">
    Destination: <span class="link text-primary">
      <a href={redirect.destination}>
        {redirect.destination}
      </a>
    </span>
  </p>
{/each}
