export function getSecureRandom(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff
}

export function getSecureRandomIfPossible(): number {
  return typeof crypto !== "undefined" ? getSecureRandom() : Math.random()
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
