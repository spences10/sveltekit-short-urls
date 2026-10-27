import { get_db, type Link } from '#lib/server/index.js';

export const load = async () => {
	try {
		const records = get_db()
			.prepare(`SELECT * FROM links WHERE visible = 1`)
			.all() as unknown as Link[];

		return { records };
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: 'Big oof! Sorry',
		};
	}
};
