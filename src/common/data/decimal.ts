export type DecimalValue = number
export type DecimalInput = number | string | DecimalValue

export function decimal(
  value: DecimalInput,
  decimalPlaces: number = 2
): DecimalValue {
  return +(+value).toFixed(decimalPlaces)
}

export function decimalFromCents(
  value: DecimalInput,
  decimalPlaces: number = 2
): DecimalValue {
  return +(+value / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces)
}

export function decimalToCents(
  value: DecimalInput,
  decimalPlaces: number = 2
): number {
  return Math.round(+value * Math.pow(10, decimalPlaces))
}

export function decimalCentsPart(
  value: DecimalInput,
  decimalPlaces: number = 2
): DecimalValue {
  return decimalPlaces * (decimal(value, decimalPlaces) % 1)
}
