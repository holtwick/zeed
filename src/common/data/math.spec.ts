import { base32ToNumber, getSecureRandom, isPrime, isPrimeRX, numberToBase32, randomBoolean, seededRandom } from './math'

/* eslint-disable no-cond-assign */
/* eslint-disable prefer-spread */

describe('math', () => {
  it('should not have collisions', () => {
    const list: number[] = Array.apply(null, Array(1000)).map(() =>
      getSecureRandom(),
    )
    let id: number | undefined
    while ((id = list.pop())) {
      expect(id >= 0).toBe(true)
      expect(id < 1).toBe(true)
      expect(list).not.toContain(id)
    }
  })

  it('should bias', () => {
    let sum = 0
    for (let i = 0; i < 1000; i++)
      sum += randomBoolean(0.1) ? 1 : 0

    expect(sum / 1000).toBeLessThan(0.2)
  })

  it('should recog primes rx', () => {
    expect(isPrimeRX(1)).toBe(false)
    expect(isPrimeRX(2)).toBe(true)
    expect(isPrimeRX(3)).toBe(true)
    expect(isPrimeRX(4)).toBe(false)
    expect(isPrimeRX(5)).toBe(true)
    expect(isPrimeRX(6)).toBe(false)
    expect(isPrimeRX(7)).toBe(true)
    expect(isPrimeRX(8)).toBe(false)
    expect(isPrimeRX(9)).toBe(false)
    expect(isPrimeRX(10)).toBe(false)
    expect(isPrimeRX(11)).toBe(true)
  })

  it('should recog primes', () => {
    expect(isPrime(1)).toBe(false)
    expect(isPrime(2)).toBe(true)
    expect(isPrime(3)).toBe(true)
    expect(isPrime(4)).toBe(false)
    expect(isPrime(5)).toBe(true)
    expect(isPrime(6)).toBe(false)
    expect(isPrime(7)).toBe(true)
    expect(isPrime(8)).toBe(false)
    expect(isPrime(9)).toBe(false)
    expect(isPrime(10)).toBe(false)
    expect(isPrime(11)).toBe(true)
  })

  it('should not be random', () => {
    expect([
      seededRandom(),
      seededRandom(),
      seededRandom(),
      seededRandom(),
      seededRandom(),
      seededRandom(),
      seededRandom(),
    ]).toMatchInlineSnapshot(`
      Array [
        0.5494555898491084,
        0.2751200274348422,
        0.6800540123456791,
        0.9710476680384088,
        0.5030392661179699,
        0.5568930041152264,
        0.4505101165980796,
      ]
    `)
  })

  it('should be b32', () => {
    expect(numberToBase32(0)).toBe('0')
    expect(numberToBase32(1)).toBe('1')
    expect(numberToBase32(31,4)).toBe('000z')
    expect(numberToBase32(32)).toBe('10')
    expect(numberToBase32(33)).toBe('11')    
    expect(numberToBase32(1024)).toBe('100')
    expect(numberToBase32(1234567890)).toBe('14tc0pj')
    expect(numberToBase32(33,4) < numberToBase32(1024,4)).toBe(true)

    expect(base32ToNumber('0')).toBe(0)
    expect(base32ToNumber('1')).toBe(1)
    expect(base32ToNumber('000z')).toBe(31)
    expect(base32ToNumber('10')).toBe(32)
    expect(base32ToNumber('11')).toBe(33)    
    expect(base32ToNumber('100')).toBe(1024)
    expect(base32ToNumber('14tc0pj')).toBe(1234567890)

    expect(base32ToNumber('zzzzz')).toBe(33554431)
    expect(base32ToNumber('zzzzzz')).toBe(1073741823)
    expect(base32ToNumber('zzzzzzz')).toBe(34359738367)
  })
})

