import { turso_client } from '$lib/server';
import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// Map to store the last sync time
const last_sync_times = new Map<string, number>();

const sync: Handle = async ({ event, resolve }) => {
	const client = turso_client();
	const now = Date.now();
	const last_sync_time = last_sync_times.get('sync') || 0;

	// Check if the last sync was more than 15 minutes ago
	if (now - last_sync_time > 15 * 60 * 1000) {
		await client.sync();
		// Update the last sync time
		last_sync_times.set('sync', now);
	}

	return await resolve(event);
};

export const handle = sequence(sync);
