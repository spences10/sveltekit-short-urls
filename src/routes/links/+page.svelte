<script lang="ts">
	import { number_crunch } from '#lib/number-crunch.js';
	import { page } from '$app/state';

	let { data } = $props();

	type Sort = 'clicks' | 'name';

	let sort: Sort = $state('clicks');
	let query = $state('');
	let copied: string | null = $state(null);
	let copied_timer: ReturnType<typeof setTimeout> | undefined;

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

	const where = (destination: string) => {
		try {
			const url = new URL(destination);
			const path = url.pathname === '/' ? '' : url.pathname;
			return `${url.host.replace(/^www\./, '')}${path}`;
		} catch {
			return destination;
		}
	};

	const copy = async (source: string) => {
		await navigator.clipboard.writeText(
			`${page.url.origin}/${source}`,
		);
		copied = source;
		clearTimeout(copied_timer);
		copied_timer = setTimeout(() => (copied = null), 1600);
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
	<header class="row masthead">
		<h1 class="domain">{page.url.hostname}</h1>
		<span class="axis" aria-hidden="true">/</span>
	</header>

	<div class="row controls">
		<p class="intro">
			Short links to my talks, videos and profiles. Add a path to the
			domain, or pick one here.
		</p>
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
	</div>

	{#if shown.length > 0}
		<ul class="links">
			{#each shown as record (record.id)}
				<li
					class="row link"
					style:--share={record.clicks / most_clicks}
				>
					<span
						class="clicks"
						data-clicks={record.clicks}
						title="{number.format(record.clicks)} clicks"
					>
						{number_crunch(record.clicks)}
						<span class="visually-hidden">clicks</span>
					</span>
					<div class="body">
						<a class="source" href="/{record.source}">
							<span aria-hidden="true">/</span>{record.source}
						</a>
						<p class="detail">
							{#if record.description}
								<span class="description">{record.description}</span>
							{/if}
							<span class="where">{where(record.destination)}</span>
						</p>
					</div>
					<button
						type="button"
						class="copy"
						onclick={() => copy(record.source)}
						aria-label="Copy {page.url.hostname}/{record.source}"
					>
						{copied === record.source ? 'Copied' : 'Copy'}
					</button>
				</li>
			{/each}
		</ul>
	{:else if records.length > 0}
		<p class="row empty">
			<span></span>
			<span>No links match “{query.trim()}”.</span>
		</p>
	{:else}
		<p class="row empty">
			<span></span>
			<span>No links yet. Add one with the ingest API.</span>
		</p>
	{/if}

	<footer class="row note">
		<span class="clicks" title="{number.format(total_clicks)} clicks">
			{number_crunch(total_clicks)}
		</span>
		<p>
			clicks on these links. Counts before 27 October 2026 include
			bots and link previews; since then only people are counted.
		</p>
	</footer>

	<p class="visually-hidden" aria-live="polite">
		{copied ? `Copied ${page.url.hostname}/${copied}` : ''}
	</p>
</main>

<style>
	.directory {
		--gap: clamp(1rem, 3vw, 2rem);
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		column-gap: var(--gap);
		max-width: 64rem;
		margin-inline: auto;
		padding: clamp(2.5rem, 8vw, 6rem) clamp(1rem, 4vw, 3rem) 4rem;
	}

	.row {
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
	}

	.masthead {
		align-items: baseline;
		font-variation-settings:
			'CASL' 1,
			'MONO' 0;
		font-size: clamp(2.25rem, 7vw, 4.5rem);
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.domain {
		grid-column: 1;
		justify-self: end;
		font: inherit;
		margin: 0;
	}

	/* The slash is the axis every source hangs from. */
	.axis {
		grid-column: 2;
		margin-left: calc(var(--gap) * -1);
		color: var(--cobalt);
	}

	.controls {
		margin-top: 1.5rem;
		margin-bottom: 2.5rem;
	}

	.intro {
		grid-column: 2 / -1;
		max-width: 36rem;
		margin: 0;
		color: var(--slate);
		font-size: 1.0625rem;
		line-height: 1.55;
	}

	.tools {
		grid-column: 2 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.filter {
		flex: 1 1 14rem;
		max-width: 22rem;
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
		display: grid;
		grid-column: 1 / -1;
		grid-template-columns: subgrid;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.link {
		position: relative;
		align-items: center;
		padding-block: 0.85rem;
		border-top: 1px solid var(--rule);
	}

	/* Tally: runs from the axis, sized by share of the top link. */
	.link::before {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		height: 3px;
		width: calc(var(--share) * 100%);
		background: var(--cobalt);
		grid-column: 2 / -1;
	}

	.clicks {
		grid-column: 1;
		justify-self: end;
		color: var(--slate);
		font-variant-numeric: tabular-nums;
		font-size: 0.9375rem;
	}

	.body {
		grid-column: 2;
		min-width: 0;
	}

	.source {
		display: inline-block;
		color: var(--ink);
		font-variation-settings:
			'CASL' 1,
			'MONO' 0;
		font-size: clamp(1.375rem, 3vw, 1.75rem);
		font-weight: 750;
		line-height: 1.15;
		letter-spacing: -0.01em;
		text-decoration: none;
		margin-left: -0.55em;
	}

	.source span {
		color: var(--cobalt);
	}

	.source:hover {
		color: var(--cobalt);
	}

	.detail {
		display: flex;
		flex-wrap: wrap;
		gap: 0 0.75rem;
		margin: 0.2rem 0 0;
		font-size: 0.9375rem;
		color: var(--slate);
	}

	.description {
		color: var(--ink);
	}

	.where {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}

	.copy {
		grid-column: 3;
		padding: 0.35rem 0.75rem;
		border: 1px solid var(--rule);
		border-radius: 0.5rem;
		background: var(--paper);
		color: var(--slate);
		font-size: 0.875rem;
		cursor: pointer;
		min-width: 5.5rem;
	}

	.copy:hover {
		color: var(--ink);
		border-color: var(--slate);
	}

	.empty {
		margin: 0;
		padding-block: 1rem;
		border-top: 1px solid var(--rule);
		color: var(--slate);
	}

	.empty span:last-child {
		grid-column: 2 / -1;
	}

	.note {
		align-items: baseline;
		margin-top: 0;
		padding-top: 1.25rem;
		border-top: 1px solid var(--rule);
		color: var(--slate);
		font-size: 0.875rem;
	}

	.note .clicks {
		color: var(--ink);
		font-weight: 650;
	}

	.note p {
		grid-column: 2 / -1;
		max-width: 36rem;
		margin: 0;
		line-height: 1.5;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 40rem) {
		.directory {
			grid-template-columns: minmax(0, 1fr) max-content;
		}

		.masthead {
			display: flex;
			font-size: clamp(2rem, 11vw, 2.75rem);
		}

		.axis {
			margin: 0;
		}

		.link::before {
			grid-column: 1 / -1;
		}

		.intro,
		.tools,
		.note p,
		.empty span:last-child {
			grid-column: 1 / -1;
		}

		.link {
			grid-template-areas:
				'body copy'
				'clicks copy';
		}

		.body {
			grid-area: body;
		}

		.clicks {
			grid-area: clicks;
			justify-self: start;
			margin-top: 0.15rem;
			font-size: 0.875rem;
		}

		.copy {
			grid-area: copy;
		}

		.source {
			margin-left: 0;
		}

		.note {
			display: block;
		}

		.note .clicks {
			display: inline;
		}

		.note p {
			display: inline;
		}

		.empty span:first-child {
			display: none;
		}
	}
</style>
