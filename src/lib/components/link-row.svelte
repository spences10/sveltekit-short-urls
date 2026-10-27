<script lang="ts">
	import type { Count, LinkRow } from '#lib/link-types.js';
	import { number_crunch } from '#lib/number-crunch.js';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { slide } from 'svelte/transition';

	let {
		link,
		open,
		share,
		host,
		origin,
		ontoggle,
	}: {
		link: LinkRow;
		open: boolean;
		/** Clicks as a share of the most clicked link, 0 to 1. */
		share: number;
		host: string;
		origin: string;
		ontoggle: () => void;
	} = $props();

	let copied = $state(false);
	let copied_timer: ReturnType<typeof setTimeout> | undefined;

	const number = new Intl.NumberFormat('en-GB');
	const regions = new Intl.DisplayNames(['en-GB'], {
		type: 'region',
	});

	let duration = $derived(prefersReducedMotion.current ? 0 : 260);
	let detail = $derived(link.detail);
	let top_referrer = $derived(
		Math.max(1, ...(detail?.referrers ?? []).map((r) => r.clicks)),
	);
	let people_total = $derived(
		(detail?.devices ?? []).reduce((sum, d) => sum + d.clicks, 0),
	);

	const where = (destination: string) => {
		try {
			const url = new URL(destination);
			const path = url.pathname === '/' ? '' : url.pathname;
			return `${url.host.replace(/^www\./, '')}${path}`;
		} catch {
			return destination;
		}
	};

	const country = (code: string) => {
		if (code === 'Unknown') return 'Unknown';
		try {
			return regions.of(code) ?? code;
		} catch {
			return code;
		}
	};

	const device = (name: string) =>
		name === 'Unknown' ? name : name[0].toUpperCase() + name.slice(1);

	const percent = (count: Count, total: number) =>
		`${Math.round((count.clicks / Math.max(1, total)) * 100)}%`;

	/** Bars grow from the left as the panel opens. */
	const grow = (
		_node: Element,
		{ delay = 0 }: { delay?: number },
	) => ({
		delay,
		duration: duration * 1.6,
		easing: cubicOut,
		css: (t: number) => `transform: scaleX(${t})`,
	});

	const copy = async () => {
		await navigator.clipboard.writeText(`${origin}/${link.source}`);
		copied = true;
		clearTimeout(copied_timer);
		copied_timer = setTimeout(() => (copied = false), 1600);
	};
</script>

<li class="link" class:open style:--share={share}>
	<button
		type="button"
		class="summary"
		aria-expanded={open}
		aria-controls="detail-{link.id}"
		onclick={ontoggle}
	>
		<span class="names">
			<span class="source"
				><span class="slash">/</span>{link.source}</span
			>
			<span class="meta">
				{#if link.description}
					<span class="description">{link.description}</span>
				{/if}
				<span class="where">{where(link.destination)}</span>
			</span>
		</span>
		<span
			class="clicks"
			data-clicks={link.clicks}
			title="{number.format(link.clicks)} clicks"
		>
			{number_crunch(link.clicks)}
			<span class="visually-hidden">clicks</span>
		</span>
		<svg
			class="chevron"
			viewBox="0 0 16 16"
			width="16"
			height="16"
			aria-hidden="true"
		>
			<path
				d="M4 6l4 4 4-4"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	{#if open}
		<div
			id="detail-{link.id}"
			class="detail"
			transition:slide={{ duration, easing: cubicOut }}
		>
			<div class="actions">
				<a class="open-link" href="/{link.source}">Open</a>
				<button type="button" class="copy" onclick={copy}>
					{copied ? 'Copied' : `Copy ${host}/${link.source}`}
				</button>
				<span class="visually-hidden" aria-live="polite">
					{copied ? `Copied ${host}/${link.source}` : ''}
				</span>
				<a
					class="destination"
					href={link.destination}
					target="_blank"
					rel="noopener noreferrer">{link.destination}</a
				>
			</div>

			<div class="panels">
				<section>
					<h3>Where clicks came from</h3>
					{#if detail && detail.referrers.length > 0}
						<ol class="bars">
							{#each detail.referrers as referrer, i (referrer.name)}
								<li>
									<span class="bar-name">{referrer.name}</span>
									<span class="bar-count"
										>{number_crunch(referrer.clicks)}</span
									>
									<span
										class="bar"
										style:--width={referrer.clicks / top_referrer}
										in:grow={{ delay: i * 40 }}
									></span>
								</li>
							{/each}
						</ol>
						{#if detail.other_referrers > 0}
							<p class="more">
								Plus {number.format(detail.other_referrers)} from other
								sites.
							</p>
						{/if}
					{:else}
						<p class="more">No referrers recorded yet.</p>
					{/if}
				</section>

				{#if detail && detail.people + detail.bots > 0}
					<section>
						<h3>Since 27 October 2026</h3>
						<dl class="figures">
							<div>
								<dt>People</dt>
								<dd>{number.format(detail.people)}</dd>
							</div>
							<div>
								<dt>Last 30 days</dt>
								<dd>{number.format(detail.people_30_days)}</dd>
							</div>
							<div>
								<dt>Bots and previews</dt>
								<dd>{number.format(detail.bots)}</dd>
							</div>
						</dl>
						{#if detail.countries.length > 0}
							<ul class="split" aria-label="Countries">
								{#each detail.countries as entry (entry.name)}
									<li>
										{country(entry.name)}
										<b>{percent(entry, people_total)}</b>
									</li>
								{/each}
							</ul>
						{/if}
						{#if detail.devices.length > 0}
							<ul class="split" aria-label="Devices">
								{#each detail.devices as entry (entry.name)}
									<li>
										{device(entry.name)}
										<b>{percent(entry, people_total)}</b>
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}
			</div>
		</div>
	{/if}
</li>

<style>
	.link {
		position: relative;
		border-top: 1px solid var(--rule);
	}

	/* Tally: share of the most clicked link, along the row's foot. */
	.link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		height: 2px;
		width: calc(var(--share) * 100%);
		background: var(--cobalt);
		opacity: 0.85;
	}

	.summary {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 0.9rem 0.25rem;
		text-align: left;
		color: inherit;
		cursor: pointer;
	}

	.summary:hover .source,
	.open .source {
		color: var(--cobalt);
	}

	.names {
		min-width: 0;
	}

	.source {
		display: block;
		font-variation-settings:
			'CASL' 1,
			'MONO' 0;
		font-size: 1.375rem;
		font-weight: 750;
		line-height: 1.2;
		letter-spacing: -0.01em;
		transition: color 120ms;
	}

	.slash {
		color: var(--cobalt);
	}

	.meta {
		display: flex;
		gap: 0.75rem;
		margin-top: 0.1rem;
		font-size: 0.9375rem;
		color: var(--slate);
		min-width: 0;
	}

	.description {
		color: var(--ink);
		flex-shrink: 0;
	}

	.where {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.clicks {
		font-variant-numeric: tabular-nums;
		font-size: 1.0625rem;
		font-weight: 600;
	}

	.chevron {
		color: var(--slate);
		transition: transform 200ms ease;
	}

	.open .chevron {
		transform: rotate(180deg);
	}

	.detail {
		padding: 0.25rem 0.25rem 1.5rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.open-link,
	.copy {
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--rule);
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: var(--ink);
		text-decoration: none;
		cursor: pointer;
	}

	.open-link {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--paper);
	}

	.copy:hover {
		border-color: var(--slate);
	}

	.destination {
		flex-basis: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.875rem;
		color: var(--slate);
	}

	.panels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1.5rem 2.5rem;
		margin-top: 1.25rem;
	}

	h3 {
		margin: 0 0 0.6rem;
		font-size: 0.9375rem;
		font-weight: 650;
	}

	.bars {
		display: grid;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.bars li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0 0.75rem;
		font-size: 0.875rem;
	}

	.bar-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar-count {
		color: var(--slate);
		font-variant-numeric: tabular-nums;
	}

	.bar {
		grid-column: 1 / -1;
		height: 4px;
		margin-top: 0.2rem;
		border-radius: 2px;
		width: calc(var(--width) * 100%);
		background: var(--cobalt);
		opacity: 0.55;
		transform-origin: left;
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.75rem;
		margin: 0;
	}

	.figures dt {
		font-size: 0.8125rem;
		color: var(--slate);
	}

	.figures dd {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 650;
		font-variant-numeric: tabular-nums;
	}

	.split {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		padding: 0;
		list-style: none;
	}

	.split,
	.more {
		margin: 0.75rem 0 0;
		font-size: 0.875rem;
		color: var(--slate);
		line-height: 1.5;
	}

	.split b {
		color: var(--ink);
		font-weight: 600;
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
		.meta {
			flex-direction: column;
			gap: 0;
		}
	}
</style>
