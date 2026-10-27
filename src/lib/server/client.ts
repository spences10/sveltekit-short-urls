import { dev } from '$app/env';
import { DATABASE_PATH } from '$app/env/private';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const db_path =
	DATABASE_PATH ??
	(dev ? './local-dev-replica.db' : '/app/data/turso-replica.db');

export interface Link {
	id: number;
	source: string;
	destination: string;
	position: number | null;
	description: string | null;
	clicks: number;
	visible: number;
}

let db: DatabaseSync | undefined;

export const get_db = (): DatabaseSync => {
	if (db) return db;

	if (db_path !== ':memory:') {
		mkdirSync(dirname(db_path), { recursive: true });
	}

	db = new DatabaseSync(db_path);
	db.exec('PRAGMA busy_timeout = 5000');

	if (db_path !== ':memory:') {
		db.exec('PRAGMA journal_mode = WAL');
		db.exec('PRAGMA synchronous = NORMAL');
	}

	db.exec(`
		CREATE TABLE IF NOT EXISTS links (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			source TEXT,
			destination TEXT,
			position INTEGER,
			description TEXT,
			clicks INTEGER,
			visible BOOLEAN
		);

		CREATE TABLE IF NOT EXISTS referrers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			link_id INTEGER,
			referrer TEXT,
			count INTEGER DEFAULT 1,
			FOREIGN KEY (link_id) REFERENCES links (id),
			UNIQUE (link_id, referrer)
		);
	`);

	return db;
};
