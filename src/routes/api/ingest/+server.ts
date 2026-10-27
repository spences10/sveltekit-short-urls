import { get_db } from '#lib/server/index.js';
import { handle_ingest } from '#lib/server/ingest.js';
import { INGEST_TOKEN } from '$app/env/private';
import type { RequestHandler } from './$types';

/**
 * Manage links with curl. Tasks: list_links, add_link, update_link,
 * delete_link.
 *
curl -X POST https://<host>/api/ingest \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $INGEST_TOKEN" \
	-d '{"task": "add_link", "data": {"source": "yt", "destination": "https://youtube.com/@scottspence", "description": "YouTube"}}'
 *
curl -X POST https://<host>/api/ingest \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $INGEST_TOKEN" \
	-d '{"task": "update_link", "data": {"source": "yt", "changes": {"visible": false}}}'
 *
curl -X POST https://<host>/api/ingest \
	-H "Content-Type: application/json" \
	-H "Authorization: Bearer $INGEST_TOKEN" \
	-d '{"task": "delete_link", "data": {"source": "yt"}}'
 */
export const POST: RequestHandler = ({ request }) =>
	handle_ingest(request, INGEST_TOKEN, get_db);
