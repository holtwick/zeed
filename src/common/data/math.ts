export function randomBoolean(bias = 0.25): boolean {
  return Math.random() < bias
}

/** max is not included, min is included */
export function randomInt(max = 100, min = 0): number {
  return min + Math.floor(Math.random() * (max - min))
}

export function randomFloat(max = 100, min = 0): number {
  return min + Math.random() * (max - min)
}

export function between(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
