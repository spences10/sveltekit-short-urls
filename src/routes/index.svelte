<script lang="ts">
  import { shortUrls } from '$lib/short-urls'
  const { redirects } = shortUrls
</script>

<h1>Short URLs with SvelteKit</h1>

<p>
  This is my short links page, each Source (or <code>pathname</code>)
  here redirects to destination.
</p>

<p>
  So if you want to check out <code>/me</code> then enter the URL for
  this site with <code>/me</code> at the end of the URL to be redirected.
</p>

<p>Or, seeing as you're here you can just click the link! 😂</p>

<table class="table">
  <!-- head -->
  <thead class="sticky top-0">
    <tr>
      <th class="text-lg">Source</th>
      <th class="text-lg">Destination</th>
    </tr>
  </thead>
  <tbody>
    <!-- rows -->
    {#each redirects as redirect}
      <tr class="hover">
        <td class="text-xl text-secondary">{redirect.source}</td>
        <td class="text-xl">
          <a
            class="link text-primary"
            href={redirect.destination}
            target="_blank"
            rel="noopener"
          >
            {redirect.destination}
          </a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
