<script lang="ts">
	export let data
	let { records } = data
</script>

<article class="prose prose-xl mb-10">
	<h1>Short URLs with SvelteKit</h1>

	<p>
		This is my short links page, each Source (or <code>pathname</code
		>) here redirects to destination.
	</p>

	<p>
		So if you want to check out <code>/me</code> then enter the URL
		for this site with <code>/me</code> at the end of the URL to be redirected.
	</p>

	<p>Or, seeing as you're here you can just click the link! 😂</p>
</article>

<ul>
	{#if records}
		{#each records as record}
			{#if record && record.description && record.source && record.destination && record.visible}
				<li
					class="prose prose-xl bg-secondary/10 rounded-md p-4 my-4 border border-primary"
				>
					<p>Description: {record.description}</p>
					<p>
						Source:
						<a class="text-secondary" href={record.source}>
							{record.source}
						</a>
					</p>
					<p>
						Destination:
						<a
							class="link text-primary"
							href={record.destination}
							target="_blank"
							rel="noopener noreferrer"
						>
							{record.destination}
						</a>
					</p>
				</li>
			{/if}
		{/each}
	{:else}
		<p>No records available.</p>
	{/if}
</ul>
