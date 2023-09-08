import { building } from '$app/environment'
import {
	UPSTASH_REDIS_REST_TOKEN,
	UPSTASH_REDIS_REST_URL,
} from '$env/static/private'
import { Redis } from '@upstash/redis'

let redis: Redis

if (!building) {
	redis = new Redis({
		url: UPSTASH_REDIS_REST_URL,
		token: UPSTASH_REDIS_REST_TOKEN,
	})
}

export const short_url_key = (): string => `short_url:`

export { redis }
