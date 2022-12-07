import { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } from '$env/static/private'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
	const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/links-list`
	try {
		const res = await fetch(AIRTABLE_URL, {
			headers: {
				Authorization: `Bearer ${AIRTABLE_TOKEN}`,
				'Content-Type': 'application/json',
			},
		})
		const { records } = await res.json()
		return { records }
	} catch (error) {
		return {
			status: 500,
			error: 'Big oof! Sorry',
		}
	}
}
