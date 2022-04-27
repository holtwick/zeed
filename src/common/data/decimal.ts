export type DecimalInput = number | string

export function decimal(value: DecimalInput, precision: number = 2): number {
  return +(+value).toFixed(precision)
}

export function decimalCentsPart(
  value: DecimalInput,
  precision: number = 2
): number {
  return precision * (decimal(value, precision) % 1)
}
