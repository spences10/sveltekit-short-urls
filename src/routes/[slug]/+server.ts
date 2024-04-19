import { turso_client } from '$lib/server';
import type { RequestEvent } from './$types';

export const GET = async ({ url }: RequestEvent) => {
	const client = turso_client();
	const key = url.pathname.startsWith('/')
		? url.pathname.substring(1)
		: url.pathname;

	// Fetch the destination URL from the database
	const { rows: destination } = await client.execute({
		sql: `SELECT destination FROM links WHERE source = ?`,
		args: [key],
	});

	if (destination.length > 0) {
		// Increment clicks for the matched record
		await client.execute({
			sql: `UPDATE links SET clicks = clicks + 1 WHERE source = ?`,
			args: [key],
		});

		return new Response(undefined, {
			status: 302,
			headers: {
				Location: String(destination[0].destination) ?? '/',
			},
		});
	} else if (url.pathname.length > 1) {
		return new Response(undefined, {
			status: 302,
			headers: { Location: '/' },
		});
	} else {
		return new Response(undefined, { status: 404 });
	}
};
