import { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } from '$env/static/private'
import type { RequestHandler } from './$types'

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/links-list`

export const GET: RequestHandler = async ({ url }) => {
	const res = await fetch(AIRTABLE_URL, {
		headers: {
			Authorization: `Bearer ${AIRTABLE_TOKEN}`,
			'Content-Type': 'application/json',
			'Cache-Control': 'max-age=0, s-maxage=3600',
		},
	})
	const { records } = await res.json()

	const [redirect] = records.filter(
		(item: { fields: { source: string } }) =>
			item.fields.source === url.pathname
	)

	if (redirect) {
		// Update clicks/visits
		let data = {
			records: [
				{
					id: redirect.id,
					fields: {
						...redirect.fields,
						clicks: redirect.fields.clicks + 1,
					},
				},
			],
		}
		// Update Airtable
		await fetch(AIRTABLE_URL, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${AIRTABLE_TOKEN}`,
				'Content-Type': 'application/json',
				accept: 'application/json',
			},
			body: JSON.stringify(data),
		})
		// redirect
		return new Response(undefined, {
			status: 302,
			headers: { Location: redirect.fields.destination },
		})
	} else if (!redirect && url.pathname.length > 1) {
		return new Response(undefined, {
			status: 302,
			headers: { Location: '/' },
		})
	} else return new Response(undefined, { status: 404 })
}
