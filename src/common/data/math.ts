export function randomBoolean(bias = 0.25) {
  return Math.random() < bias ? 0 : 1
}

/** max is not included, min is included */
export function randomInt(max = 100, min = 0) {
  return min + Math.floor(Math.random() * (max - min))
}

export function randomFloat(max = 100, min = 0) {
  return min + Math.random() * (max - min)
}
