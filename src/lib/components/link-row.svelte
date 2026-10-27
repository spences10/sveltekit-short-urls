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
			<span class="heading">
				<span class="plate">/{link.source}</span>
				{#if link.description}
					<span class="description">{link.description}</span>
				{/if}
			</span>
			<span class="where">{where(link.destination)}</span>
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
				<a
					class="open-link"
					href="/{link.source}"
					target="_blank"
					rel="noopener"
				>
					Go to /{link.source}
				</a>
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
									<span class="bar-count">
										{number_crunch(referrer.clicks)}
									</span>
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

	.open {
		background: var(--ground-raised);
	}

	/* Lane line: a dashed tally of share against the busiest link. */
	.link::after {
		content: '';
		position: absolute;
		left: 0.75rem;
		bottom: 0.4rem;
		height: 3px;
		width: calc(var(--share) * (100% - 1.5rem));
		background: repeating-linear-gradient(
			90deg,
			var(--lane) 0 1.25rem,
			transparent 1.25rem 2rem
		);
		opacity: 0.55;
	}

	.summary {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1rem 0.75rem 1.4rem;
		text-align: left;
		color: inherit;
		cursor: pointer;
	}

	.names {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}

	.heading {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.75rem;
	}

	/* Route plate: sign green with the inset white border of a road sign. */
	.plate {
		padding: 0.3rem 0.65rem 0.15rem;
		border-radius: 0.4rem;
		background: var(--sign);
		color: var(--sign-ink);
		box-shadow:
			inset 0 0 0 2px var(--sign),
			inset 0 0 0 3.5px var(--sign-ink);
		font-size: 1.125rem;
		font-weight: 750;
		line-height: 1.2;
		letter-spacing: 0.01em;
		overflow-wrap: anywhere;
	}

	.description {
		font-size: 1.0625rem;
		font-weight: 600;
	}

	.where {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.9375rem;
		color: var(--muted);
	}

	.clicks {
		font-variant-numeric: tabular-nums;
		font-size: 1.125rem;
		font-weight: 700;
	}

	.chevron {
		color: var(--muted);
		transition: transform 200ms ease;
	}

	.summary:hover .chevron {
		color: var(--ink);
	}

	.open .chevron {
		color: var(--signal);
		transform: rotate(180deg);
	}

	.detail {
		padding: 0.25rem 0.75rem 1.75rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.75rem;
	}

	.open-link,
	.copy {
		padding: 0.45rem 0.9rem 0.35rem;
		border-radius: 0.4rem;
		font-size: 0.9375rem;
		font-weight: 650;
		text-decoration: none;
		cursor: pointer;
	}

	.open-link {
		background: var(--sign);
		color: var(--sign-ink);
		box-shadow:
			inset 0 0 0 2px var(--sign),
			inset 0 0 0 3.5px var(--sign-ink);
	}

	.copy {
		border: 2px solid var(--rule);
		color: var(--ink);
	}

	.copy:hover {
		border-color: var(--muted);
	}

	.destination {
		flex-basis: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.875rem;
		color: var(--muted);
	}

	.panels {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: 1.75rem 2.5rem;
		margin-top: 1.5rem;
	}

	h3 {
		margin: 0 0 0.75rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.bars {
		display: grid;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.bars li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0 0.75rem;
		font-size: 0.9375rem;
	}

	.bar-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar-count {
		font-variant-numeric: tabular-nums;
		font-weight: 650;
	}

	.bar {
		grid-column: 1 / -1;
		height: 4px;
		margin-top: 0.3rem;
		width: calc(var(--width) * 100%);
		background: repeating-linear-gradient(
			90deg,
			var(--lane) 0 0.9rem,
			transparent 0.9rem 1.4rem
		);
		opacity: 0.6;
		transform-origin: left;
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 2rem;
		margin: 0;
	}

	.figures dt {
		font-size: 0.875rem;
		color: var(--muted);
	}

	.figures dd {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 750;
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
		margin: 0.85rem 0 0;
		font-size: 0.9375rem;
		color: var(--muted);
		line-height: 1.5;
	}

	.split b {
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

	@media (max-width: 40rem) {
		.summary {
			padding-inline: 0.25rem;
		}

		.detail {
			padding-inline: 0.25rem;
		}
	}
</style>
