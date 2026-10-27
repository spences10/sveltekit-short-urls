import { get_db, links_store } from '#lib/server/index.js';
import { link_details } from '#lib/server/link-stats.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	try {
		const db = get_db();
		const details = link_details(db, url.hostname);
		return {
			records: links_store(db)
				.list_visible_with_clicks()
				.map((link) => ({
					...link,
					detail: details.get(link.id) ?? null,
				})),
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: 'Big oof! Sorry',
		};
	}
};
