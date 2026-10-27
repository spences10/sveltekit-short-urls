import { defineConfig } from '@playwright/test';
import { env } from 'node:process';

const port = Number(env.PLAYWRIGHT_PORT ?? 4173);

export default defineConfig({
	webServer: {
		command: `pnpm run build && pnpm run preview --port ${port}`,
		port,
	},

	testMatch: '**/*.e2e.{ts,js}',
});
