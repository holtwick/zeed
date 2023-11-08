import { XRX } from './xrx'

describe('xrx', () => {
  it('simple', () => {
    const xrx = new XRX(String.raw`([a-z]+)`, 'gim')
    const rx = xrx.rx
    const sample = '123 Hello World'
    let result = xrx.exec(sample)

    expect(result[0]).toBe('Hello')
    expect(result.index).toBe(4)

    expect(sample.match(rx)).toEqual(['Hello', 'World'])

    result = xrx.execAll(sample)
    expect(result.length).toBe(2)

    expect(xrx.replace(sample, '?')).toBe('123 ? ?')
    expect(xrx.replace(sample, (m: any) => m.toLowerCase())).toBe(
      '123 hello world',
    )
  })

  it('negative Look Around in RX', () => {
    const xrx = new XRX(String.raw`(?<!\.)(\d+)(?!\.)`, 'gim')
    const sample = '1 .2 3..4. 555 a666'
    const result = xrx.execAll(sample)

    // console.log('All', result)

    expect(result[0][0]).toBe('1')
    expect(result[1][0]).toBe('555')
    expect(result[2][0]).toBe('666')
    expect(result.length).toBe(3)
  })

  it('extended Flag', () => {
    const xrx = new XRX(
      String.raw`
        
                   # Here is nothing        
        (\  \d+)   # Comment
        
        `,
      'gimx',
    )
    const sample = 'a1 2 33 vier4\n5'
    const result = xrx.execAll(sample)

    // console.log('All', result)

    expect(result[0][0]).toBe(' 2')
    expect(result[1][0]).toBe(' 33')
    expect(result.length).toBe(2)
  })

  it('named Groups', () => {
    const xrx = new XRX(String.raw`(?<chars>[a-z]+)|(?<nums>\d+)`, 'gim')
    const sample = 'Hello 123 World'
    const result = xrx.execAll(sample)

    expect(result[0].chars).toBe('Hello')
    expect(result[1].nums).toBe('123')
    expect(result[2].chars).toBe('World')
    expect(result.length).toBe(3)

    // console.log('result', result)
  })
})
