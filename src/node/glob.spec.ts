import { globToRegExp } from './glob'

describe('glob.spec', () => {
  it('should match', async () => {
    let re = globToRegExp('p*uck')
    expect(re.test('pot luck')).toBe(true)
    expect(re.test('pluck')).toBe(true)
    expect(re.test('puck')).toBe(true)

    re = globToRegExp('*.min.js')
    expect(re.test('http://example.com/jquery.min.js')).toBe(true)
    expect(re.test('http://example.com/jquery.min.js.map')).toBe(false)

    re = globToRegExp('*/www/*.js')
    expect(re.test('http://example.com/www/app.js')).toBe(true)
    expect(re.test('http://example.com/www/lib/factory-proxy-model-observer.js')).toBe(true)

    // Extended globs
    re = globToRegExp('*/www/{*.js,*.html}', { extended: true })
    expect(re.test('http://example.com/www/app.js')).toBe(true)
    expect(re.test('http://example.com/www/index.html')).toBe(true)
  })
})
