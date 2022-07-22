<script lang="ts">
  export let records: any[] = []
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
    {#each records as { fields: { destination, source, visible } }}
      {visible}
      {#if visible}
        <tr class="hover">
          <td class="text-xl">
            <a class="text-secondary" href={source}>
              {source}
            </a>
          </td>
          <td class="text-xl">
            <a
              class="link text-primary"
              href={destination}
              target="_blank"
              rel="noopener"
            >
              {destination}
            </a>
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
