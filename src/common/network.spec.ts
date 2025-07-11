import { fetchBasic, fetchJson, fetchOptionsBasicAuth, fetchOptionsFormURLEncoded, fetchOptionsJson, fetchText, parseBasicAuth } from './network'

describe('network', () => {
  it('should fetch', async () => {
    if (globalThis.isNodeTestEnv) {
      const html = await fetchText('https://example.com')
      expect(html).toContain('<html')
    }
    else {
      const html = await fetchText('/')
      expect(html).toContain('<html')
    }
  })

  it('should parse basic auth', () => {
    const url = 'https://user:pass@example.com/?x=1'
    expect(parseBasicAuth(url)).toMatchInlineSnapshot(`
      Object {
        "password": "pass",
        "url": "https://example.com/?x=1",
        "username": "user",
      }
    `)
  })

  // it("should do a test call", async () => {
  //   let text = await fetchJson(
  //     "https://user:123@httpbin.org/basic-auth/user/123"
  //   )
  //   expect(text).toMatchInlineSnapshot(`
  //     {
  //       "authenticated": true,
  //       "user": "user",
  //     }
  //   `)

  //   let post = await fetchJson(
  //     "https://httpbin.org/post",
  //     fetchOptionsJson({ a: 1 }, "POST")
  //   )

  //   // @ts-ignore
  //   expect(post?.data).toMatchInlineSnapshot('"{\\"a\\":1}"')
  // })
})

describe('fetchBasic', () => {
  it('should return response for 2xx status', async () => {
    const mockResponse = { status: 200, text: async () => 'ok' }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchBasic('http://x', {}, fetchFn as any)
    expect(res).toBe(mockResponse)
  })
  it('should log and return undefined for 4xx/5xx status', async () => {
    const mockResponse = { status: 404, text: async () => 'not found' }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchBasic('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
  it('should handle parseBasicAuth and merge options', async () => {
    const mockResponse = { status: 200, text: async () => 'ok' }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchBasic('http://user:pass@x', {}, fetchFn as any)
    expect(res).toBe(mockResponse)
  })
  it('should handle headers as plain object', async () => {
    const mockResponse = { status: 200, text: async () => 'ok' }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchBasic('http://x', { headers: { foo: 'bar' } }, fetchFn as any)
    expect(res).toBe(mockResponse)
  })
  it('should log error on fetch exception', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))
    const res = await fetchBasic('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
})

describe('fetchJson', () => {
  it('should return parsed JSON', async () => {
    const mockResponse = { status: 200, json: async () => ({ a: 1 }) }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchJson('http://x', {}, fetchFn as any)
    expect(res).toEqual({ a: 1 })
  })
  it('should return undefined on error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))
    const res = await fetchJson('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
  it('should return undefined if fetchBasic returns undefined', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined)
    const res = await fetchJson('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
})

describe('fetchText', () => {
  it('should return text', async () => {
    const mockResponse = { status: 200, text: async () => 'hello' }
    const fetchFn = vi.fn().mockResolvedValue(mockResponse)
    const res = await fetchText('http://x', {}, fetchFn as any)
    expect(res).toBe('hello')
  })
  it('should return undefined on error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))
    const res = await fetchText('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
  it('should return undefined if fetchBasic returns undefined', async () => {
    const fetchFn = vi.fn().mockResolvedValue(undefined)
    const res = await fetchText('http://x', {}, fetchFn as any)
    expect(res).toBeUndefined()
  })
})

describe('fetchOptionsFormURLEncoded', () => {
  it('should return correct options', () => {
    const opts = fetchOptionsFormURLEncoded({ a: 1 }, 'POST')
    expect(opts.method).toBe('POST')
    expect(opts.headers!['Content-Type']).toContain('application/x-www-form-urlencoded')
    expect(typeof opts.body).toBe('string')
  })
})

describe('fetchOptionsJson', () => {
  it('should return correct options', () => {
    const opts = fetchOptionsJson({ a: 1 }, 'PUT')
    expect(opts.method).toBe('PUT')
    expect(opts.headers!['Content-Type']).toContain('application/json')
    expect(typeof opts.body).toBe('string')
  })
})

describe('fetchOptionsBasicAuth', () => {
  it('should return correct Authorization header', () => {
    const opts = fetchOptionsBasicAuth('user', 'pass')
    expect(opts.headers!.Authorization).toContain('Basic')
  })
})
