import type { DatabaseSync } from 'node:sqlite';
import type { ClickEvent } from './analytics/capture.js';

export interface Link {
	id: number;
	source: string;
	destination: string;
	description: string | null;
	position: number | null;
	visible: number;
	created_at: number;
	updated_at: number;
}

/** A visible link with legacy clicks plus human clicks since. */
export interface LinkWithClicks extends Link {
	clicks: number;
}

export interface LinkInput {
	source: string;
	destination: string;
	description?: string | null;
	position?: number | null;
	visible?: boolean;
}

export const links_store = (db: DatabaseSync) => ({
	by_source(source: string) {
		return db
			.prepare('SELECT * FROM links WHERE source = ?')
			.get(source) as Link | undefined;
	},

	list() {
		return db
			.prepare('SELECT * FROM links ORDER BY source')
			.all() as unknown as Link[];
	},

	list_visible_with_clicks() {
		return db
			.prepare(
				`SELECT l.*,
					COALESCE((SELECT clicks FROM legacy_clicks WHERE link_id = l.id), 0)
					+ (SELECT COUNT(*) FROM click_events WHERE link_id = l.id AND is_bot = 0)
					AS clicks
				FROM links l
				WHERE l.visible = 1`,
			)
			.all() as unknown as LinkWithClicks[];
	},

	add(input: LinkInput, now = Date.now()) {
		return db
			.prepare(
				`INSERT INTO links (source, destination, description, position, visible, created_at, updated_at)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				RETURNING *`,
			)
			.get(
				input.source,
				input.destination,
				input.description ?? null,
				input.position ?? null,
				input.visible === false ? 0 : 1,
				now,
				now,
			) as unknown as Link;
	},

	update(
		source: string,
		changes: Partial<LinkInput>,
		now = Date.now(),
	) {
		const existing = this.by_source(source);
		if (!existing) return undefined;
		return db
			.prepare(
				`UPDATE links
				SET source = ?, destination = ?, description = ?, position = ?, visible = ?, updated_at = ?
				WHERE id = ?
				RETURNING *`,
			)
			.get(
				changes.source ?? existing.source,
				changes.destination ?? existing.destination,
				changes.description === undefined
					? existing.description
					: changes.description,
				changes.position === undefined
					? existing.position
					: changes.position,
				changes.visible === undefined
					? existing.visible
					: changes.visible
						? 1
						: 0,
				now,
				existing.id,
			) as unknown as Link;
	},

	/** Deletes the link with its legacy totals and click events. */
	remove(source: string) {
		return (
			db.prepare('DELETE FROM links WHERE source = ?').run(source)
				.changes > 0
		);
	},

	record_click(link_id: number, event: ClickEvent) {
		db.prepare(
			`INSERT INTO click_events (link_id, visitor_hash, referrer, country, browser, os, device_type, is_bot, preview_source, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		).run(
			link_id,
			event.visitor_hash,
			event.referrer,
			event.country,
			event.browser,
			event.os,
			event.device_type,
			event.is_bot ? 1 : 0,
			event.preview_source,
			event.created_at,
		);
	},
});
