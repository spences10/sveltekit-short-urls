import type { DatabaseSync } from 'node:sqlite';
import type { Count, LinkDetail } from '../link-types.js';
import { referrer_source } from './analytics/visitor.js';

const top_referrers = 6;
const top_countries = 4;
const day_ms = 24 * 60 * 60 * 1000;

const tally = (
	counts: Map<string, number>,
	name: string,
	n: number,
) => counts.set(name, (counts.get(name) ?? 0) + n);

const ranked = (counts: Map<string, number>): Count[] =>
	[...counts]
		.map(([name, clicks]) => ({ name, clicks }))
		.sort(
			(a, b) => b.clicks - a.clicks || a.name.localeCompare(b.name),
		);

/**
 * Per-link detail for every link. Legacy referrers are raw Referer
 * headers, so they are normalised the same way new clicks are before
 * merging. Only people count towards referrers, countries and devices.
 */
export function link_details(
	db: DatabaseSync,
	own_host: string,
	now = Date.now(),
): Map<number, LinkDetail> {
	const referrers = new Map<number, Map<string, number>>();
	const countries = new Map<number, Map<string, number>>();
	const devices = new Map<number, Map<string, number>>();
	const details = new Map<number, LinkDetail>();

	const detail_for = (link_id: number) => {
		let detail = details.get(link_id);
		if (!detail) {
			detail = {
				referrers: [],
				other_referrers: 0,
				people: 0,
				people_30_days: 0,
				bots: 0,
				countries: [],
				devices: [],
			};
			details.set(link_id, detail);
		}
		return detail;
	};
	const counts_for = (
		maps: Map<number, Map<string, number>>,
		link_id: number,
	) => {
		let counts = maps.get(link_id);
		if (!counts) {
			counts = new Map();
			maps.set(link_id, counts);
		}
		return counts;
	};

	for (const row of db
		.prepare('SELECT link_id, referrer, count FROM legacy_referrers')
		.all() as unknown as {
		link_id: number;
		referrer: string;
		count: number;
	}[]) {
		const source =
			row.referrer === 'direct'
				? null
				: referrer_source(row.referrer, own_host);
		tally(
			counts_for(referrers, row.link_id),
			source ?? 'Direct',
			row.count,
		);
	}

	for (const row of db
		.prepare(
			`SELECT link_id, referrer, country, device_type, is_bot, created_at
			FROM click_events`,
		)
		.all() as unknown as {
		link_id: number;
		referrer: string | null;
		country: string | null;
		device_type: string | null;
		is_bot: number;
		created_at: number;
	}[]) {
		const detail = detail_for(row.link_id);
		if (row.is_bot) {
			detail.bots++;
			continue;
		}
		detail.people++;
		if (now - row.created_at < 30 * day_ms) detail.people_30_days++;
		tally(
			counts_for(referrers, row.link_id),
			row.referrer ?? 'Direct',
			1,
		);
		tally(
			counts_for(countries, row.link_id),
			row.country ?? 'Unknown',
			1,
		);
		tally(
			counts_for(devices, row.link_id),
			row.device_type ?? 'Unknown',
			1,
		);
	}

	for (const [link_id, counts] of referrers) {
		const all = ranked(counts);
		const detail = detail_for(link_id);
		detail.referrers = all.slice(0, top_referrers);
		detail.other_referrers = all
			.slice(top_referrers)
			.reduce((sum, count) => sum + count.clicks, 0);
	}
	for (const [link_id, counts] of countries)
		detail_for(link_id).countries = ranked(counts).slice(
			0,
			top_countries,
		);
	for (const [link_id, counts] of devices)
		detail_for(link_id).devices = ranked(counts);

	return details;
}
