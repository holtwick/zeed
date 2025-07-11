import { encodeQuery, linkifyPlainText, toHumanReadableUrl, parseQuery } from './url'

describe('url', () => {
  it('split string to URLs', () => {
    const sample = 'https://example.com has <strange & fancy> some example.com at end http://example.com some'
    expect(linkifyPlainText(sample)).toBe(
      '<a target="_blank" href="https://example.com">example.com</a> has &lt;strange &amp; fancy&gt; some example.com at end <a target="_blank" href="http://example.com">example.com</a> some',
    )
  })

  it('should make human readable url', () => {
    expect(toHumanReadableUrl('example.com')).toEqual('example.com')
    expect(toHumanReadableUrl('https://www.receipts-app.com/')).toEqual('receipts-app.com')
    expect(toHumanReadableUrl('https://pdfify.app/')).toEqual('pdfify.app')
    expect(toHumanReadableUrl('https://pdfify.app/more/subpage.html?query=123')).toEqual('pdfify.app/more/subpage.html?query=123')
  })

  it('should build query', () => {
    const data = {
      a: 1,
      b: '2',
      c: null,
      d: undefined,
      e: 0,
    }
    expect(encodeQuery(data)).toMatchInlineSnapshot('"a=1&b=2&e=0"')
    expect(encodeQuery(data, v => !!v)).toMatchInlineSnapshot('"a=1&b=2"')
  })

  describe('parseQuery', () => {
    it('parses simple query', () => {
      expect(parseQuery('a=1&b=2')).toEqual({ a: '1', b: '2' })
      expect(parseQuery('?a=1&b=2')).toEqual({ a: '1', b: '2' })
    })
    it('handles repeated keys as arrays', () => {
      expect(parseQuery('a=1&a=2')).toEqual({ a: ['1', '2'] })
      expect(parseQuery('a=1&a=2&a=3')).toEqual({ a: ['1', '2', '3'] })
    })
    it('handles empty and missing values', () => {
      expect(parseQuery('a=&b=')).toEqual({ a: '', b: '' })
      expect(parseQuery('a')).toEqual({ a: '' })
      expect(parseQuery('')).toEqual({}) // implementation returns { '': '' }
    })
    it('decodes URI components', () => {
      expect(parseQuery('a=hello%20world&b=%26%3D')).toEqual({ a: 'hello world', b: '&=' })
      expect(parseQuery('a%20b=1%202')).toEqual({ 'a b': '1 2' })
    })
    it('handles mixed single and array', () => {
      expect(parseQuery('a=1&a=2&b=3')).toEqual({ a: ['1', '2'], b: '3' })
      expect(parseQuery('a=1&b=2&a=3')).toEqual({ a: ['1', '3'], b: '2' })
    })
    it('handles keys with = in value', () => {
      expect(parseQuery('a=1=2&b=3')).toEqual({ a: '1=2', b: '3' })
    })
    it('handles leading ?', () => {
      expect(parseQuery('?a=1')).toEqual({ a: '1' })
    })
  })
})
