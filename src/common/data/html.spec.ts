import { describe, it, expect } from 'vitest'
import { escapeHTML, unescapeHTML } from './html'

describe('html', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHTML('&')).toBe('&amp;')
    expect(escapeHTML('<')).toBe('&lt;')
    expect(escapeHTML('>')).toBe('&gt;')
    expect(escapeHTML("'")).toBe('&apos;')
    expect(escapeHTML('"')).toBe('&quot;')
    expect(escapeHTML('<div>&"\'</div>')).toBe('&lt;div&gt;&amp;&quot;&apos;&lt;/div&gt;')
    expect(escapeHTML('no special')).toBe('no special')
  })

  it('should unescape HTML entities', () => {
    expect(unescapeHTML('&amp;')).toBe('&')
    expect(unescapeHTML('&lt;')).toBe('<')
    expect(unescapeHTML('&gt;')).toBe('>')
    expect(unescapeHTML('&apos;')).toBe("'")
    expect(unescapeHTML('&quot;')).toBe('"')
    expect(unescapeHTML('&lt;div&gt;&amp;&quot;&apos;&lt;/div&gt;')).toBe('<div>&"\'</div>')
    expect(unescapeHTML('no special')).toBe('no special')
  })

  it('should handle mixed and repeated entities', () => {
    expect(unescapeHTML('&amp;&amp;')).toBe('&&')
    expect(unescapeHTML('&lt;&gt;&lt;')).toBe('<><')
    expect(escapeHTML('<<>>')).toBe('&lt;&lt;&gt;&gt;')
  })
})
