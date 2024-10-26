export type DecimalValue = number
export type DecimalInput = number | string | DecimalValue

/** 
 * The float returned is guaraneteed to have only the `decimalPlaces` length,
 * no rounding errors or float arithmetic artefacts. 
 */
export function decimal(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return +(+value).toFixed(decimalPlaces)
}

/** `123` becomes `1.23` */
export function decimalFromCents(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return +(+value / 10 ** decimalPlaces).toFixed(decimalPlaces)
}

/** `1.23` becomes `123` */
export function decimalToCents(
  value: DecimalInput,
  decimalPlaces = 2,
): number {
  return Math.round(+value * 10 ** decimalPlaces)
}

/** `1.23` becomes `23` */
export function decimalCentsPart(
  value: DecimalInput,
  decimalPlaces = 2,
): DecimalValue {
  return decimalPlaces * (decimal(value, decimalPlaces) % 1)
}
