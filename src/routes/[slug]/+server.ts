import { click_event } from '#lib/server/analytics/capture.js';
import { get_db, links_store } from '#lib/server/index.js';
import { ANALYTICS_SALT } from '$app/env/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({
	params,
	request,
	url,
	getClientAddress,
}) => {
	const links = links_store(get_db());
	const link = links.by_source(params.slug);

	if (!link) {
		return new Response(undefined, {
			status: 302,
			headers: { Location: '/' },
		});
	}

	try {
		links.record_click(
			link.id,
			click_event(
				request.headers,
				getClientAddress(),
				url.hostname,
				ANALYTICS_SALT,
			),
		);
	} catch (error) {
		// Analytics never breaks a redirect.
		console.error('[analytics] Could not record a click', error);
	}

	return new Response(undefined, {
		status: 302,
		headers: { Location: link.destination },
	});
};
