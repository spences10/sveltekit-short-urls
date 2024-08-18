import { turso_client } from '$lib/server';

export const load = async () => {
	const client = turso_client();

	try {
		// Fetch all records from the SQLite database
		const { rows: records } = await client.execute(`
      SELECT * FROM links WHERE visible = 1
    `);

		return { records };
	} catch (error) {
		console.error(error);
		return {
			status: 500,
			error: 'Big oof! Sorry',
		};
	}
};
