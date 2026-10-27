import { defineEnvVars } from '@sveltejs/kit/env';

const private_runtime = {
	public: false,
	static: false,
	schema: (value: string | undefined) => value || undefined,
};

export const variables = defineEnvVars({
	PUBLIC_FATHOM_ID: { public: true, static: true },
	PUBLIC_FATHOM_URL: { public: true, static: true },
	DATABASE_PATH: {
		...private_runtime,
		description:
			'Path to the SQLite database, defaults to ./data/short-urls.db',
	},
	ANALYTICS_SALT: {
		...private_runtime,
		description:
			'Salt for daily rotating visitor hashes. Unset uses a per-process salt.',
	},
});
