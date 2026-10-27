import { createHash, randomBytes } from 'node:crypto';

// Search engines under their own names; other sources by hostname.
const search_engines: [RegExp, string][] = [
	[/^(?:www\.)?google\.[a-z.]+$/, 'Google'],
	[
		/^android-app:\/\/com\.google\.android\.googlequicksearchbox/,
		'Google',
	],
	[/^(?:www\.)?bing\.com$/, 'Bing'],
	[/^(?:www\.)?duckduckgo\.com$/, 'DuckDuckGo'],
	[/^search\.brave\.com$/, 'Brave Search'],
	[/^(?:www\.)?kagi\.com$/, 'Kagi'],
	[/^(?:www\.)?ecosia\.org$/, 'Ecosia'],
	[/^(?:www\.)?yandex\.[a-z]+$/, 'Yandex'],
];

/**
 * The referrer as a source name: a search engine, a hostname without
 * `www.`, 'Internal' for this site, or null for direct. The full URL,
 * with its path and query, is never stored.
 */
export function referrer_source(
	referrer: string | null,
	own_host: string,
): string | null {
	if (!referrer) return null;
	if (referrer.startsWith('android-app://'))
		return (
			search_engines.find(([pattern]) =>
				pattern.test(referrer),
			)?.[1] ?? null
		);
	let host: string;
	try {
		host = new URL(
			referrer.includes('://') ? referrer : `https://${referrer}`,
		).hostname.toLowerCase();
	} catch {
		return null;
	}
	const bare = host.replace(/^www\./, '');
	if (bare === own_host.replace(/^www\./, '')) return 'Internal';
	return (
		search_engines.find(([pattern]) => pattern.test(host))?.[1] ??
		(bare || null)
	);
}

/** Cloudflare's country code; 'XX' (unknown) and 'T1' (Tor) are dropped. */
export function country_of(header: string | null) {
	const code = header?.trim().toUpperCase() ?? '';
	return /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1'
		? code
		: null;
}

// Without ANALYTICS_SALT, a salt for this process only: visitors split
// across a restart, but no fixed default salt exists to guess.
const process_salt = randomBytes(32).toString('hex');

/**
 * A daily-rotating visitor hash: the same browser gets a new one each
 * UTC day. The IP address is used here and then discarded.
 */
export function visitor_hash(
	ip: string,
	user_agent: string | null,
	salt: string | undefined,
	now = Date.now(),
) {
	const day = new Date(now).toISOString().slice(0, 10);
	return createHash('sha256')
		.update(
			`${ip}|${user_agent ?? ''}|${day}|${salt || process_salt}`,
		)
		.digest('hex')
		.slice(0, 16);
}
