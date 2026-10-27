import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { expect, test } from 'vite-plus/test';
import { link_details } from './link-stats.js';
import { links_store } from './links.js';

const schema = readFileSync(
	new URL('./schema.sql', import.meta.url),
	'utf8',
);

test('merges legacy and new referrers and skips bots', () => {
	const db = new DatabaseSync(':memory:');
	db.exec(schema);
	const now = Date.now();
	const link = links_store(db).add({
		source: 'yt',
		destination: 'https://youtube.com',
	});
	const legacy = db.prepare(
		'INSERT INTO legacy_referrers (link_id, referrer, count) VALUES (?, ?, ?)',
	);
	legacy.run(link.id, 'direct', 5);
	legacy.run(link.id, 'https://www.google.com/search?q=x', 3);
	legacy.run(link.id, 'https://short.example/links', 2);

	const click = db.prepare(
		`INSERT INTO click_events (link_id, visitor_hash, referrer, country, device_type, is_bot, created_at)
		VALUES (?, 'aaaaaaaaaaaaaaaa', ?, ?, ?, ?, ?)`,
	);
	click.run(link.id, 'Google', 'GB', 'mobile', 0, now);
	click.run(link.id, null, 'GB', 'desktop', 0, now - 40 * 864e5);
	click.run(link.id, 'Slack', null, null, 1, now);

	const detail = link_details(db, 'short.example', now).get(link.id);

	expect(detail?.referrers).toEqual([
		{ name: 'Direct', clicks: 6 },
		{ name: 'Google', clicks: 4 },
		{ name: 'Internal', clicks: 2 },
	]);
	expect(detail).toMatchObject({
		people: 2,
		people_30_days: 1,
		bots: 1,
		countries: [{ name: 'GB', clicks: 2 }],
	});
});
