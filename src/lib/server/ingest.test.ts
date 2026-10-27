import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { beforeEach, describe, expect, test } from 'vite-plus/test';
import { handle_ingest } from './ingest.js';
import { links_store } from './links.js';

const token = 'x'.repeat(32);
const schema = readFileSync(
	new URL('./schema.sql', import.meta.url),
	'utf8',
);

let db: DatabaseSync;

beforeEach(() => {
	db = new DatabaseSync(':memory:');
	db.exec('PRAGMA foreign_keys = ON');
	db.exec(schema);
});

const ingest = (body: unknown, auth = `Bearer ${token}`) =>
	handle_ingest(
		new Request('http://localhost/api/ingest', {
			method: 'POST',
			headers: { authorization: auth },
			body: JSON.stringify(body),
		}),
		token,
		() => db,
	);

const add = (data: unknown) => ingest({ task: 'add_link', data });

describe('handle_ingest', () => {
	test('refuses a wrong token', async () => {
		const response = await ingest(
			{ task: 'list_links' },
			'Bearer no',
		);
		expect(response.status).toBe(401);
	});

	test('is disabled without a token', async () => {
		const response = await handle_ingest(
			new Request('http://localhost', { method: 'POST' }),
			undefined,
			() => db,
		);
		expect(response.status).toBe(503);
	});

	test('adds, updates, lists and deletes a link', async () => {
		const added = await add({
			source: 'yt',
			destination: 'https://youtube.com',
		});
		expect(added.status).toBe(200);

		const updated = await ingest({
			task: 'update_link',
			data: { source: 'yt', changes: { visible: false } },
		});
		expect(await updated.json()).toMatchObject({
			source: 'yt',
			visible: 0,
		});

		const listed = await ingest({ task: 'list_links' });
		expect(await listed.json()).toHaveLength(1);

		const deleted = await ingest({
			task: 'delete_link',
			data: { source: 'yt' },
		});
		expect(deleted.status).toBe(200);
		expect(links_store(db).list()).toHaveLength(0);
	});

	test('rejects a duplicate source', async () => {
		await add({ source: 'yt', destination: 'https://youtube.com' });
		const response = await add({
			source: 'yt',
			destination: 'https://example.com',
		});
		expect(response.status).toBe(409);
	});

	test('rejects reserved sources and bad URLs', async () => {
		const reserved = await add({
			source: 'links',
			destination: 'https://example.com',
		});
		expect(reserved.status).toBe(400);

		const bad_url = await add({
			source: 'ok',
			destination: 'not a url',
		});
		expect(bad_url.status).toBe(400);
	});

	test('returns 404 for a missing link', async () => {
		const response = await ingest({
			task: 'delete_link',
			data: { source: 'nope' },
		});
		expect(response.status).toBe(404);
	});
});

describe('links_store clicks', () => {
	test('adds human clicks to legacy totals, ignoring bots', () => {
		const links = links_store(db);
		const link = links.add({
			source: 'yt',
			destination: 'https://youtube.com',
		});
		db.prepare(
			'INSERT INTO legacy_clicks (link_id, clicks) VALUES (?, 10)',
		).run(link.id);

		const click = {
			visitor_hash: 'a'.repeat(16),
			referrer: null,
			country: null,
			browser: null,
			os: null,
			device_type: null,
			preview_source: null,
			created_at: Date.now(),
		};
		links.record_click(link.id, { ...click, is_bot: false });
		links.record_click(link.id, { ...click, is_bot: true });

		expect(links.list_visible_with_clicks()[0].clicks).toBe(11);
	});
});
