import { encodeQuery, linkifyPlainText, toHumanReadableUrl, parseQuery, linkifyPlainTextWithLineBreaks } from './url'

describe('url', () => {
  it('split string to URLs', () => {
    const sample = 'https://example.com has <strange & fancy> some example.com at end http://example.com some'
    expect(linkifyPlainText(sample)).toMatchInlineSnapshot(
      `"<a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a> has &lt;strange &amp; fancy&gt; some <a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a> at end <a target="_blank" rel="noopener noreferrer" class="_warn" href="http://example.com">example.com</a> some"`,
    )
    const input = 'W9ju7_qXXFY2h221-k0Xp1u-Odg2TS3d_kxv9u_U-SYXsJA'
    expect(linkifyPlainText(input)).toBe(input)
  })

  it('converts a simple http URL', () => {
    const input = 'visit http://example.com'
    const expected = 'visit <a target="_blank" rel="noopener noreferrer" class="_warn" href="http://example.com">example.com</a>'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('converts a simple https URL and cleans the display text', () => {
    const input = 'visit https://www.example.com'
    const expected = 'visit <a target="_blank" rel="noopener noreferrer" href="https://www.example.com">example.com</a>'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('handles trailing punctuation correctly', () => {
    const input = 'Go to example.com.'
    const expected = 'Go to <a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a>.'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('handles trailing parentheses when balanced', () => {
    const input = 'A link (https://en.wikipedia.org/wiki/URL_(Uniform_Resource_Locator))'
    const expected = 'A link (<a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/URL_(Uniform_Resource_Locator)">en.wikipedia.org/wiki/URL_(Uniform_Resource_Locator)</a>)'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('trims trailing parenthesis when unbalanced', () => {
    const input = 'A link (https://example.com).'
    const expected = 'A link (<a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a>).'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('converts email addresses', () => {
    const input = 'contact me at user@example.com'
    const expected = 'contact me at <a target="_blank" rel="noopener noreferrer" href="mailto:user@example.com">user@example.com</a>'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('handles multiple links and text correctly', () => {
    const input = 'Check example.com and mailto:test@test.com for info.'
    const expected = 'Check <a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a> and <a target="_blank" rel="noopener noreferrer" href="mailto:test@test.com">test@test.com</a> for info.'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('escapes HTML in surrounding text', () => {
    const input = '<p>visit example.com</p>'
    const expected = '&lt;p&gt;visit <a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a>&lt;/p&gt;'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('handles newlines correctly', () => {
    const input = 'line one\nexample.com\nline three'
    const expected = 'line one<br><a target="_blank" rel="noopener noreferrer" href="https://example.com">example.com</a><br>line three'
    expect(linkifyPlainTextWithLineBreaks(input)).toBe(expected)
  })

  it('handles custom scheme correctly', () => {
    const input = 'Note obsidian://something?a=1 three'
    expect(linkifyPlainTextWithLineBreaks(input)).toMatchInlineSnapshot(`"Note obsidian://something?a=1 three"`)
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
