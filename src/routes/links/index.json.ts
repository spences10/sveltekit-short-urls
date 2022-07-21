export const GET = async () => {
  const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
  const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN
  const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/links-list`
  try {
    const res = await fetch(AIRTABLE_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    return {
      status: 200,
      body: await res.json(),
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
