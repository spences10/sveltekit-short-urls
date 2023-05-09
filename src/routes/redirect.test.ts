import { redirect } from '@sveltejs/kit'
import { describe, expect, it } from 'vitest'

describe('Redirect', () => {
  it('should return a redirect object with the given status and location', () => {
    const result = redirect(302, 'https://scottspence.com')
    expect(result).toEqual({
      status: 302,
      location: 'https://scottspence.com',
    })
  })
})