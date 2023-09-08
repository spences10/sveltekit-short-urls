import { redis, short_url_key } from '$lib/redis'

export const load = async () => {
	const base_key = short_url_key()

	try {
		// Fetch all short URL keys
		const all_keys: string[] = await redis.keys(`${base_key}*`)

		const records = await Promise.all(
			all_keys.map(async (key) => {
				const data: RedirectData | null = await redis.hgetall(key)
				return {
					source: key.replace(base_key, ''),
					destination: data?.destination,
					position: data?.position,
					description: data?.description,
					clicks: data?.clicks,
				}
			})
		)

		return { records }
	} catch (error) {
		console.error(error)
		return {
			status: 500,
			error: 'Big oof! Sorry',
		}
	}
}
