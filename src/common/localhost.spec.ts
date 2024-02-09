import { isLocalHost } from './localhost'

describe('localhost', () => {
  it('should be accurate', () => {
    const samples = {
      '1.1.1.1': false,
      '127.0.0.1': true,
      '10.0.0.99': true,
      '192.168.0.99': true,
      'space.local': true,
      'holtwick.de': false,
      'somename': false,
      'local': false,
      'localhost': true,
      '::1': true,
    }
    for (const [domain, result] of Object.entries(samples)) {
      // console.log(domain, result)
      expect(isLocalHost(domain)).toBe(result)
      expect(isLocalHost() != null).toBe(true)
    }
  })
})
