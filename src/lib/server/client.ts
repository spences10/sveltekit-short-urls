import { dev } from '$app/environment';
import { createClient, type Client } from '@libsql/client';

const LOCAL_DB_PATH = dev
	? './local-dev-replica.db'
	: '/app/data/turso-replica.db';

let client_instance: Client | null = null;

export const turso_client = (): Client => {
	if (client_instance) {
		return client_instance;
	}

	client_instance = createClient({
		url: `file:${LOCAL_DB_PATH}`,
	});

	return client_instance;
};
