import { get_db, type Link } from '#lib/server/index.js';
import type { RequestEvent } from './$types';

export const GET = async ({ url, request }: RequestEvent) => {
	const db = get_db();
	const key = url.pathname.startsWith('/')
		? url.pathname.substring(1)
		: url.pathname;

	const referrer = request.headers.get('referer') || 'direct';

	// Fetch the destination URL and id from the database
	const link = db
		.prepare(`SELECT id, destination FROM links WHERE source = ?`)
		.get(key) as Pick<Link, 'id' | 'destination'> | undefined;

	if (link) {
		// Increment clicks for the matched record
		db.prepare(
			`UPDATE links SET clicks = clicks + 1 WHERE source = ?`,
		).run(key);

		// Check if the referrer already exists for this link
		const existing_referrer = db
			.prepare(
				`SELECT count FROM referrers WHERE link_id = ? AND referrer = ?`,
			)
			.get(link.id, referrer);

		if (existing_referrer) {
			// Increment the count for the existing referrer
			db.prepare(
				`UPDATE referrers SET count = count + 1 WHERE link_id = ? AND referrer = ?`,
			).run(link.id, referrer);
		} else {
			// Insert a new record for the referrer
			db.prepare(
				`INSERT INTO referrers (link_id, referrer, count) VALUES (?, ?, 1)`,
			).run(link.id, referrer);
		}

		return new Response(undefined, {
			status: 302,
			headers: {
				Location:
					typeof link.destination === 'string'
						? link.destination
						: '/',
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
