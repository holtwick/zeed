import { base64, base32agnoster } from './basex-secure'

describe('baseX-secure', () => {
   
  it('should do the same as atob and btoa', () => {
    const str = 'Hello, World!'
    const bin = new TextEncoder().encode(str)
    expect(base64.encode(bin)).toBe('SGVsbG8sIFdvcmxkIQ==')
    expect(btoa(str)).toBe('SGVsbG8sIFdvcmxkIQ==')
    expect(base64.encode(bin)).toBe(btoa(str))
    expect(base64.decode(btoa(str))).toEqual(bin)
  })

   it('should support 32-agnoster like for Swift', () => {
      let originalString = "Hello"
      let data = new TextEncoder().encode(originalString)
      let encodedString = base32agnoster.encode(data)
      expect(encodedString).toBe("91jprv3f")
    })
  
})
