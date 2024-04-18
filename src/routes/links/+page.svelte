<script lang="ts">
	export let data;
	let { records } = data;

	let sort_order: 'asc' | 'desc' = 'desc';

	const toggle_sort_order = () => {
		sort_order = sort_order === 'asc' ? 'desc' : 'asc';
	};

	$: sorted_records = records
		? [...records].sort((a, b) => {
				const clicks_a = parseInt(a.clicks || '0', 10);
				const clicks_b = parseInt(b.clicks || '0', 10);
				return sort_order === 'asc'
					? clicks_a - clicks_b
					: clicks_b - clicks_a;
			})
		: [];
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

	<button on:click={toggle_sort_order} class="btn btn-primary">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="h-6 w-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
			/>
		</svg>
	</button>
</article>

<ul>
	{#if sorted_records}
		{#each sorted_records as record}
			{#if record && record.description && record.source && record.destination && record.visible}
				<li
					class="prose prose-xl my-4 rounded-md border border-primary bg-secondary/10 p-4"
				>
					<p>Description: {record.description}</p>
					<p>Clicks: {record.clicks}</p>
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
