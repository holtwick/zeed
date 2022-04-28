export type DecimalInput = number | string

export function decimal(
  value: DecimalInput,
  decimalPlaces: number = 2
): number {
  return +(+value).toFixed(decimalPlaces)
}

export function decimalFromCents(
  value: DecimalInput,
  decimalPlaces: number = 2
): number {
  return +(+value / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces)
}

export function decimalCentsPart(
  value: DecimalInput,
  decimalPlaces: number = 2
): number {
  return decimalPlaces * (decimal(value, decimalPlaces) % 1)
}
