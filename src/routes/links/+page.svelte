<script lang="ts">
	let { data } = $props();
	let { records } = data;
	let sort_order: 'asc' | 'desc' = $state('desc');

	const toggle_sort_order = () => {
		sort_order = sort_order === 'asc' ? 'desc' : 'asc';
	};

	let sorted_records = $derived.by(() => {
		if (!records) return [];
		return [...records].sort((a, b) => {
			const clicks_a = a.clicks;
			const clicks_b = b.clicks;
			return sort_order === 'asc'
				? Number(clicks_a ?? 0) - Number(clicks_b ?? 0)
				: Number(clicks_b ?? 0) - Number(clicks_a ?? 0);
		});
	});
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

	<button onclick={toggle_sort_order} class="btn btn-primary">
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
	{#if sorted_records.length > 0}
		{#each sorted_records as record}
			{#if record && record.description && record.source && record.destination && record.visible}
				<li
					class="prose prose-xl border-primary bg-secondary/10 my-4 rounded-md border p-4"
				>
					<p>Description: {record.description}</p>
					<p>Clicks: {record.clicks}</p>
					<p>
						Source:
						<a class="text-secondary" href={record.source.toString()}>
							{record.source}
						</a>
					</p>
					<p>
						Destination:
						<a
							class="link text-primary"
							href={record.destination.toString()}
							target="_blank"
							rel="noopener noreferrer"
						>
							{record.destination.toString()}
						</a>
					</p>
				</li>
			{/if}
		{/each}
	{:else}
		<p>No records available.</p>
	{/if}
</ul>
