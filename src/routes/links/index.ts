import { AIRTABLE_BASE_ID, AIRTABLE_TOKEN } from '$lib/env-vars'

export const GET = async () => {
  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/links-list`
  try {
    const res = await fetch(AIRTABLE_URL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    const { records } = await res.json()
    return {
      status: 200,
      body: { records },
    }
  } catch (error) {
    return {
      status: 500,
      body: {
        error: 'Big oof! Sorry',
      },
    }
  }
}
