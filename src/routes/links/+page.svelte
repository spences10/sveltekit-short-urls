<script lang="ts">
	import LinkRow from '#lib/components/link-row.svelte';
	import { number_crunch } from '#lib/number-crunch.js';
	import { page } from '$app/state';

	let { data } = $props();

	type Sort = 'clicks' | 'name';

	let sort: Sort = $state('clicks');
	let query = $state('');
	let open_id: number | null = $state(null);

	const number = new Intl.NumberFormat('en-GB');

	let records = $derived(data.records ?? []);
	let most_clicks = $derived(
		Math.max(1, ...records.map((record) => record.clicks)),
	);
	let total_clicks = $derived(
		records.reduce((sum, record) => sum + record.clicks, 0),
	);

	let shown = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		const matches = needle
			? records.filter((record) =>
					[record.source, record.description, record.destination]
						.join(' ')
						.toLowerCase()
						.includes(needle),
				)
			: records;
		return [...matches].sort((a, b) =>
			sort === 'clicks'
				? b.clicks - a.clicks || a.source.localeCompare(b.source)
				: a.source.localeCompare(b.source),
		);
	});

	const toggle = (id: number) => {
		open_id = open_id === id ? null : id;
	};
</script>

<svelte:head>
	<title>{page.url.hostname} links</title>
	<meta
		name="description"
		content="Short links for Scott Spence's talks, videos and profiles."
	/>
</svelte:head>

<main class="directory">
	<header>
		<h1>{page.url.hostname}<span class="slash">/</span></h1>
		<p class="intro">
			Short links to my talks, videos and profiles. Pick one to see
			where its clicks come from.
		</p>
	</header>

	<div class="tools">
		<label class="filter">
			<span class="visually-hidden">Filter links</span>
			<input
				type="search"
				placeholder="Filter links"
				bind:value={query}
				autocomplete="off"
				spellcheck="false"
			/>
		</label>
		<div class="sort" role="group" aria-label="Sort links">
			<button
				type="button"
				aria-pressed={sort === 'clicks'}
				onclick={() => (sort = 'clicks')}>Most clicked</button
			>
			<button
				type="button"
				aria-pressed={sort === 'name'}
				onclick={() => (sort = 'name')}>A to Z</button
			>
		</div>
	</div>

	{#if shown.length > 0}
		<ul class="links">
			{#each shown as record (record.id)}
				<LinkRow
					link={record}
					open={open_id === record.id}
					share={record.clicks / most_clicks}
					host={page.url.hostname}
					origin={page.url.origin}
					ontoggle={() => toggle(record.id)}
				/>
			{/each}
		</ul>
	{:else if records.length > 0}
		<p class="empty">No links match “{query.trim()}”.</p>
	{:else}
		<p class="empty">No links yet. Add one with the ingest API.</p>
	{/if}

	<footer class="note">
		<b title="{number.format(total_clicks)} clicks"
			>{number_crunch(total_clicks)}</b
		>
		clicks on these links. Counts before 27 October 2026 include bots and
		link previews; since then only people are counted.
	</footer>
</main>

<style>
	.directory {
		max-width: 46rem;
		margin-inline: auto;
		padding: clamp(2.5rem, 7vw, 5rem) 1rem 4rem;
	}

	h1 {
		margin: 0;
		font-variation-settings:
			'CASL' 1,
			'MONO' 0;
		font-size: clamp(2.25rem, 8vw, 3.5rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.slash {
		color: var(--cobalt);
	}

	.intro {
		max-width: 34rem;
		margin: 1rem 0 0;
		color: var(--slate);
		font-size: 1.0625rem;
		line-height: 1.55;
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 2rem 0 1.25rem;
	}

	.filter {
		flex: 1 1 14rem;
	}

	input {
		width: 100%;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--rule);
		border-radius: 0.5rem;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	input::placeholder {
		color: var(--slate);
	}

	.sort {
		display: inline-flex;
		border: 1px solid var(--rule);
		border-radius: 0.5rem;
		padding: 0.2rem;
	}

	.sort button {
		padding: 0.35rem 0.8rem;
		border-radius: 0.35rem;
		color: var(--slate);
		font-weight: 500;
		cursor: pointer;
	}

	.sort button[aria-pressed='true'] {
		background: var(--ink);
		color: var(--paper);
	}

	.links {
		margin: 0;
		padding: 0;
		list-style: none;
		border-bottom: 1px solid var(--rule);
	}

	.empty {
		margin: 0;
		padding-block: 1rem;
		border-top: 1px solid var(--rule);
		color: var(--slate);
	}

	.note {
		max-width: 34rem;
		margin-top: 1.5rem;
		color: var(--slate);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.note b {
		color: var(--ink);
		font-weight: 650;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
