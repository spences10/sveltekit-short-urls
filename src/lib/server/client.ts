import { DATABASE_PATH } from '$app/env/private';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import schema from './schema.sql?raw';

const db_path = DATABASE_PATH ?? './data/short-urls.db';

let db: DatabaseSync | undefined;

export const get_db = (): DatabaseSync => {
	if (db) return db;

	if (db_path !== ':memory:') {
		mkdirSync(dirname(db_path), { recursive: true });
	}

	db = new DatabaseSync(db_path);
	db.exec('PRAGMA foreign_keys = ON');
	db.exec('PRAGMA busy_timeout = 5000');

	if (db_path !== ':memory:') {
		db.exec('PRAGMA journal_mode = WAL');
		db.exec('PRAGMA synchronous = NORMAL');
	}

	db.exec(schema);

	return db;
};
