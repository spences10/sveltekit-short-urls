import { turso_client } from '$lib/server';
import type { RequestEvent } from './$types';

export const GET = async ({ url, request }: RequestEvent) => {
	const client = turso_client();
	const key = url.pathname.startsWith('/')
		? url.pathname.substring(1)
		: url.pathname;

	const referrer = request.headers.get('referer') || 'direct';

	// Fetch the destination URL and id from the database
	const { rows: destination } = await client.execute({
		sql: `SELECT id, destination FROM links WHERE source = ?`,
		args: [key],
	});

	if (destination.length > 0) {
		const link_id = destination[0].id;

		// Increment clicks for the matched record
		await client.execute({
			sql: `UPDATE links SET clicks = clicks + 1 WHERE source = ?`,
			args: [key],
		});

		// Check if the referrer already exists for this link
		const { rows: referrer_rows } = await client.execute({
			sql: `SELECT count FROM referrers WHERE link_id = ? AND referrer = ?`,
			args: [link_id, referrer],
		});

		if (referrer_rows.length > 0) {
			// Increment the count for the existing referrer
			await client.execute({
				sql: `UPDATE referrers SET count = count + 1 WHERE link_id = ? AND referrer = ?`,
				args: [link_id, referrer],
			});
		} else {
			// Insert a new record for the referrer
			await client.execute({
				sql: `INSERT INTO referrers (link_id, referrer, count) VALUES (?, ?, 1)`,
				args: [link_id, referrer],
			});
		}

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
