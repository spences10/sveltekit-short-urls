import { redis, short_url_key } from '$lib/redis'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import type { RequestEvent } from './$types'

export const config: ServerlessConfig = {
	runtime: 'nodejs18.x',
}

export const GET = async ({ url }: RequestEvent) => {
	const key = `${short_url_key()}${url.pathname.substring(1)}`

	// Fetch destination URL and clicks from Redis
	const redirect_data: RedirectData | null = await redis.hgetall(key)

	if (redirect_data && Object.keys(redirect_data).length !== 0) {
		// Update clicks/visits
		await redis.hincrby(key, 'clicks', 1)

		// Redirect
		return new Response(undefined, {
			status: 302,
			headers: { Location: redirect_data.destination! }, // The '!' asserts that destination is non-null.
		})
	} else if (!redirect_data && url.pathname.length > 1) {
		return new Response(undefined, {
			status: 302,
			headers: { Location: '/' },
		})
	} else {
		return new Response(undefined, { status: 404 })
	}
}
