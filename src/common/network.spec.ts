import { fetchText, parseBasicAuth } from './network'

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
