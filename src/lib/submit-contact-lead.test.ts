import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { submitContactLead } from './submit-contact-lead'

describe('submitContactLead', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_COMPANY_SLUG', 'past-and-present')
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com/api')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('posts to the tenant-scoped contact submit endpoint', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'sub-1', status: 'submitted' }),
    })

    const payload = {
      name: 'Jane',
      email: 'jane@test.com',
      subject: 'Hello',
      message: 'Need help',
    }
    const result = await submitContactLead(payload)

    expect(result.status).toBe('submitted')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/forms/public/past-and-present/contact/submit/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ payload, source: 'web' }),
      }),
    )
  })

  it('throws when company slug is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_COMPANY_SLUG', '')
    await expect(
      submitContactLead({ name: 'a', email: 'a@t.com', subject: 's', message: 'm' }),
    ).rejects.toThrow(/NEXT_PUBLIC_COMPANY_SLUG/)
  })
})
