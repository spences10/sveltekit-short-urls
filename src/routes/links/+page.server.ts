import { get_db, links_store } from '#lib/server/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	try {
		return {
			records: links_store(get_db()).list_visible_with_clicks(),
		};
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: 'Big oof! Sorry',
		};
	}
};
