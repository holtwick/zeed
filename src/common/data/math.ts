export function getSecureRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF
}

export function getSecureRandomIfPossible(): number {
  return typeof crypto !== 'undefined' ? getSecureRandom() : Math.random()
}

export function randomBoolean(bias = 0.25): boolean {
  return getSecureRandomIfPossible() < bias
}

/** max is not included, min is included */
export function randomInt(max = 100, min = 0): number {
  return min + Math.floor(getSecureRandomIfPossible() * (max - min))
}

export function randomFloat(max = 100, min = 0): number {
  return min + getSecureRandomIfPossible() * (max - min)
}

export function between(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** See also arraySum */
export function sum(array: number[]): number {
  return array.reduce((acc, value) => acc + value, 0)
}

/** See also arrayAvg */
export function avg(array: number[]): number {
  return sum(array) / array.length
}

// export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

// https://www.noulakaz.net/2007/03/18/a-regular-expression-to-check-for-prime-numbers/
/** Fancy prime number check ;) */
export function isPrimeRX(value: number): boolean {
  // eslint-disable-next-line regexp/no-super-linear-backtracking
  return !/^1?$|^(1{2,}?)\1+$/.test('1'.repeat(value))
}

export function isPrime(value: number): boolean {
  for (let i = 2; i < value; i++) {
    if (value % i === 0)
      return false
  }
  return value > 1
}

// http://indiegamr.com/generate-repeatable-random-numbers-in-js/
// https://softwareengineering.stackexchange.com/questions/260969/original-source-of-seed-9301-49297-233280-random-algorithm

let _seed = 6

/** Deterministic random */
export function seededRandom(max = 0, min = 1, seed?: number) {
  _seed = ((seed ?? _seed) * 9301 + 49297) % 233280
  const rnd = _seed / 233280
  return min + rnd * (max - min)
}
