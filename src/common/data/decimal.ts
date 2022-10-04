export type DecimalValue = number
export type DecimalInput = number | string | DecimalValue

export function decimal(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return +(+value).toFixed(decimalPlaces)
}

export function decimalFromCents(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return +(+value / 10 ** decimalPlaces).toFixed(decimalPlaces)
}

export function decimalToCents(
  value: DecimalInput,
  decimalPlaces = 2,
): number {
  return Math.round(+value * 10 ** decimalPlaces)
}

export function decimalCentsPart(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return decimalPlaces * (decimal(value, decimalPlaces) % 1)
}
