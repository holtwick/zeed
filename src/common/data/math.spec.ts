import {
  getSecureRandom,
  isPrime,
  isPrimeRX,
  randomBoolean,
  seededRandom,
} from "./math"

describe("math", () => {
  it("should not have collisions", () => {
    let list: number[] = Array.apply(null, Array(1000)).map(() =>
      getSecureRandom()
    )
    let id: number | undefined
    while ((id = list.pop())) {
      expect(id >= 0).toBe(true)
      expect(id < 1).toBe(true)
      expect(list).not.toContain(id)
    }
  })

  it("should bias", () => {
    let sum = 0
    for (let i = 0; i < 1000; i++) {
      sum += randomBoolean(0.1) ? 1 : 0
    }
    expect(sum / 1000).toBeLessThan(0.2)
  })

  it("should recog primes rx", () => {
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

  it("should recog primes", () => {
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

  it("should not be random", () => {
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
})
