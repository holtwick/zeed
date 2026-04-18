import { escapeRegExp } from './regexp'

describe('escapeRegExp', () => {
  it('returns empty string for falsy input', () => {
    expect(escapeRegExp('')).toBe('')
    // @ts-expect-error testing falsy
    expect(escapeRegExp(undefined)).toBe('')
    // @ts-expect-error testing falsy
    expect(escapeRegExp(null)).toBe('')
  })

  it('returns source of RegExp input', () => {
    expect(escapeRegExp(/foo\.bar/)).toBe('foo\\.bar')
  })

  it('escapes all special characters', () => {
    expect(escapeRegExp('\\-[]/{}()*+?.^$|')).toBe('\\\\\\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\^\\$\\|')
  })

  it('leaves normal characters alone', () => {
    expect(escapeRegExp('hello world 123')).toBe('hello world 123')
  })

  it('escaped string works as literal in RegExp', () => {
    const src = 'a.b+c'
    const re = new RegExp(escapeRegExp(src))
    expect(re.test('a.b+c')).toBe(true)
    expect(re.test('axbxc')).toBe(false)
  })
})
