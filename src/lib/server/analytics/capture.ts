import {
	parse_user_agent,
	type ParsedUserAgent,
} from './user-agent.js';
import {
	country_of,
	referrer_source,
	visitor_hash,
} from './visitor.js';

export interface ClickEvent extends ParsedUserAgent {
	visitor_hash: string;
	referrer: string | null;
	country: string | null;
	created_at: number;
}

/** A click from the request headers. The IP address is not kept. */
export function click_event(
	headers: Headers,
	client_address: string,
	own_host: string,
	salt: string | undefined,
	now = Date.now(),
): ClickEvent {
	const user_agent = headers.get('user-agent');
	return {
		visitor_hash: visitor_hash(
			headers.get('cf-connecting-ip') ?? client_address,
			user_agent,
			salt,
			now,
		),
		referrer: referrer_source(headers.get('referer'), own_host),
		country: country_of(headers.get('cf-ipcountry')),
		...parse_user_agent(user_agent),
		created_at: now,
	};
}
