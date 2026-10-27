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
		<div class="sign">
			<h1>{page.url.hostname}</h1>
			<p class="sign-sub">Talks, videos and profiles</p>
			<svg
				class="arrow"
				viewBox="0 0 48 48"
				aria-hidden="true"
				width="48"
				height="48"
			>
				<path
					d="M24 4 L40 22 H29 V44 H19 V22 H8 Z"
					fill="currentColor"
				/>
			</svg>
		</div>
		<p class="intro">
			Every short link here forwards to somewhere else. Pick one to
			see where its traffic comes from.
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
		<div
			class="sort"
			class:by-name={sort === 'name'}
			role="group"
			aria-label="Sort links"
		>
			<span class="indicator" aria-hidden="true"></span>
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
		padding: clamp(2rem, 6vw, 4.5rem) 1rem 4rem;
	}

	/* The page's one big sign, with the white inset border of the real thing. */
	.sign {
		position: relative;
		padding: clamp(1.25rem, 4vw, 2rem) clamp(1.25rem, 4vw, 2.25rem);
		padding-right: clamp(4.5rem, 12vw, 6.5rem);
		border-radius: 1rem;
		background: var(--sign);
		color: var(--sign-ink);
		box-shadow:
			inset 0 0 0 0.45rem var(--sign),
			inset 0 0 0 0.7rem var(--sign-ink);
	}

	h1 {
		margin: 0;
		font-size: clamp(2.5rem, 9vw, 4.25rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.01em;
		overflow-wrap: anywhere;
	}

	.sign-sub {
		margin: 0.6rem 0 0;
		font-size: clamp(1.0625rem, 3vw, 1.375rem);
		font-weight: 600;
	}

	.arrow {
		position: absolute;
		top: 50%;
		right: clamp(1.25rem, 4vw, 2.25rem);
		width: clamp(2.25rem, 7vw, 3.25rem);
		height: auto;
		transform: translateY(-50%);
	}

	.intro {
		max-width: 34rem;
		margin: 1.25rem 0 0;
		color: var(--muted);
		font-size: 1.0625rem;
		line-height: 1.55;
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 2rem 0 1rem;
	}

	.filter {
		flex: 1 1 14rem;
	}

	input {
		width: 100%;
		padding: 0.6rem 0.85rem 0.45rem;
		border: 2px solid var(--rule);
		border-radius: 0.5rem;
		background: transparent;
		color: inherit;
		font: inherit;
	}

	input::placeholder {
		color: var(--muted);
	}

	/* Two equal halves, so the indicator slides exactly one half across. */
	.sort {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 0.25rem;
		border: 2px solid var(--rule);
		border-radius: 0.5rem;
		isolation: isolate;
	}

	.indicator {
		position: absolute;
		inset: 0.25rem auto 0.25rem 0.25rem;
		width: calc(50% - 0.25rem);
		border-radius: 0.3rem;
		background: var(--signal);
		z-index: -1;
		transition: transform 380ms cubic-bezier(0.68, -0.35, 0.32, 1.35);
	}

	.by-name .indicator {
		transform: translateX(100%);
	}

	.sort button {
		padding: 0.4rem 0.9rem 0.3rem;
		color: var(--muted);
		font-weight: 650;
		white-space: nowrap;
		cursor: pointer;
		transition: color 200ms;
	}

	.sort button[aria-pressed='true'] {
		color: var(--signal-ink);
	}

	@media (prefers-reduced-motion: reduce) {
		.indicator,
		.sort button {
			transition: none;
		}
	}

	.links {
		margin: 0;
		padding: 0;
		list-style: none;
		border-bottom: 1px solid var(--rule);
	}

	.empty {
		margin: 0;
		padding: 1rem 0.75rem;
		border-top: 1px solid var(--rule);
		color: var(--muted);
	}

	.note {
		max-width: 34rem;
		margin-top: 1.75rem;
		color: var(--muted);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.note b {
		color: var(--ink);
		font-weight: 700;
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
