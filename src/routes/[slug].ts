import { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } from '$lib/env-vars'
import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async ({ url }) => {
  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/links-list`
  const res = await fetch(AIRTABLE_URL, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=0, s-maxage=3600',
    },
  })
  const { records } = await res.json()

  const [redirect] = records.filter(
    item => item.fields.source === url.pathname
  )

  if (redirect) {
    return {
      headers: { Location: redirect.fields.destination },
      status: 302,
    }
  } else if (!redirect && url.pathname.length > 1) {
    return {
      headers: { Location: '/' },
      status: 302,
    }
  } else return {}
}
