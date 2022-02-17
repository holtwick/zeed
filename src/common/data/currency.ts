// Original taken from https://github.com/scurker/currency.js
// @ts-nocheck

import { arrayFlatten } from "./array"

export type CurrencyInput = number | string | Currency

type CurrencyFormat = (currency?: Currency, opts?: CurrencyOptions) => string

interface CurrencyOptions {
  symbol?: string
  separator?: string
  decimal?: string
  errorOnInvalid?: boolean
  precision?: number
  increment?: number
  useVedic?: boolean
  pattern?: string
  negativePattern?: string
  format?: CurrencyFormat
  fromCents?: boolean
  groups?: RegExp
}

const defaults = {
  symbol: "$",
  separator: ",",
  decimal: ".",
  errorOnInvalid: false,
  precision: 2,
  pattern: "!#",
  negativePattern: "-!#",
  format,
  fromCents: false,
}

const round = (v: number) => Math.round(v)
const pow = (p: number) => Math.pow(10, p)
const rounding = (value: number, increment: number) =>
  round(value / increment) * increment

const groupRegex = /(\d)(?=(\d{3})+\b)/g
const vedicRegex = /(\d)(?=(\d\d)+\d\b)/g

export function currency(
  value: CurrencyInput,
  opts: CurrencyOptions = {}
): Currency {
  return new Currency(value, opts)
}

/**
 * Immuteable currency representation
 */
export class Currency {
  public readonly intValue: number
  public readonly value: number
  private readonly _settings: CurrencyOptions
  private readonly _precision: number

  constructor(value: CurrencyInput, opts: CurrencyOptions = {}) {
    let settings = Object.assign({}, defaults, opts)
    let precision = pow(settings.precision ?? 2)
    let v = parse(value, settings)

    this.intValue = v
    this.value = v / precision

    // Set default incremental value
    settings.increment = settings.increment || 1 / precision

    // Support vedic numbering systems
    // see: https://en.wikipedia.org/wiki/Indian_numbering_system
    if (settings.useVedic) {
      settings.groups = vedicRegex
    } else {
      settings.groups = groupRegex
    }

    // Intended for internal usage only - subject to change
    this._settings = settings
    this._precision = precision
  }

  add(number: CurrencyInput): Currency {
    let { intValue, _settings, _precision } = this
    return currency(
      (intValue += parse(number, _settings)) /
        (_settings.fromCents ? 1 : _precision),
      _settings
    )
  }

  subtract(number: CurrencyInput): Currency {
    let { intValue, _settings, _precision } = this
    return currency(
      (intValue -= parse(number, _settings)) /
        (_settings.fromCents ? 1 : _precision),
      _settings
    )
  }

  multiply(number: CurrencyInput): Currency {
    // todo
    let { intValue, _settings, _precision } = this
    return currency(
      (intValue *= number) / (_settings.fromCents ? 1 : pow(_precision)),
      _settings
    )
  }

  divide(number: CurrencyInput): Currency {
    let { intValue, _settings } = this
    return currency((intValue /= parse(number, _settings, false)), _settings)
  }

  distribute(count: number): number[] {
    let { intValue, _precision, _settings } = this,
      distribution = [],
      split = Math[intValue >= 0 ? "floor" : "ceil"](intValue / count),
      pennies = Math.abs(intValue - split * count),
      precision = _settings.fromCents ? 1 : _precision

    for (; count !== 0; count--) {
      let item = currency(split / precision, _settings)

      // Add any left over pennies
      pennies-- > 0 &&
        (item = item[intValue >= 0 ? "add" : "subtract"](1 / precision))

      distribution.push(item)
    }

    return distribution as any
  }

  dollars(): number {
    return ~~this.value
  }

  cents(): number {
    let { intValue, _precision } = this
    return ~~(intValue % _precision)
  }

  format(options: CurrencyOptions | Function) {
    let { _settings } = this
    if (typeof options === "function") {
      return options(this, _settings)
    }
    return _settings.format(this, Object.assign({}, _settings, options))
  }

  toString(): string {
    let { intValue, _precision, _settings } = this
    return rounding(intValue / _precision, _settings.increment).toFixed(
      _settings.precision
    )
  }

  toJSON(): number {
    return this.value
  }

  static zero = new Currency(0)
  static one = new Currency(1)
  static hundred = new Currency(100)

  static sum(...array: (CurrencyInput | CurrencyInput[])[]): Currency {
    return arrayFlatten(array).reduce(
      (acc, value) => currency(acc).add(value),
      this.zero
    )
  }

  static avg(...array: (CurrencyInput | CurrencyInput[])[]): Currency {
    let arr = arrayFlatten(array)
    return arr
      .reduce((acc, value) => currency(acc).add(value), this.zero)
      .divide(arr.length)
  }
}

function parse(
  value: CurrencyInput,
  opts: CurrencyOptions,
  useRounding = true
): number | never {
  let v: any = 0,
    { decimal, errorOnInvalid, precision: decimals, fromCents } = opts,
    precision = pow(decimals),
    isNumber = typeof value === "number"

  if (value instanceof Currency && fromCents) {
    return value.intValue
  }

  if (isNumber || value instanceof Currency) {
    v = value instanceof Currency ? value.value : value
  } else if (typeof value === "string") {
    let regex = new RegExp("[^-\\d" + decimal + "]", "g"),
      decimalString = new RegExp("\\" + decimal, "g")
    v = value
      .replace(/\((.*)\)/, "-$1") // allow negative e.g. (1.99)
      .replace(regex, "") // replace any non numeric values
      .replace(decimalString, ".") // convert any decimal values
    v = v || 0
  } else {
    if (errorOnInvalid) {
      throw Error("Invalid Input")
    }
    v = 0
  }

  if (!fromCents) {
    v *= precision // scale number to integer value
    v = v.toFixed(4) // Handle additional decimal for proper rounding.
  }

  return useRounding ? round(v) : v
}

function format(currency: Currency, settings: CurrencyOptions): string {
  let { pattern, negativePattern, symbol, separator, decimal, groups } =
      settings,
    split = ("" + currency).replace(/^-/, "").split("."),
    dollars = split[0],
    cents = split[1]

  return (currency.value >= 0 ? pattern : negativePattern)
    .replace("!", symbol)
    .replace(
      "#",
      dollars.replace(groups, "$1" + separator) + (cents ? decimal + cents : "")
    )
}

// todo: percent calculations

// From https://v2.dinerojs.com/docs/api/formatting/to-unit MIT

export type RoundingMode = (value: number) => number

export const isHalf = (value: number) => Math.abs(value) % 1 === 0.5
export const isEven = (value: number) => value % 2 === 0

export const roundUp: RoundingMode = (value) => Math.ceil(value)
export const roundDown: RoundingMode = (value) => Math.floor(value)
export const roundHalfUp: RoundingMode = (value) => Math.round(value)

/**
 * Round a number with half values to nearest odd integer.
 */
export const roundHalfOdd: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value)) {
    return rounded
  }
  return isEven(rounded) ? rounded - 1 : rounded
}

/**
 * Round a number with half values to nearest integer farthest from zero.
 */
export const roundHalfAwayFromZero: RoundingMode = (value) => {
  return isHalf(value)
    ? Math.sign(value) * Math.ceil(Math.abs(value))
    : Math.round(value)
}

/**
 * Round a number with half values down.
 */
export const roundHalfDown: RoundingMode = (value) =>
  isHalf(value) ? Math.floor(value) : Math.round(value)

/**
 * Round a number with half values to nearest even integer.
 * https://wiki.c2.com/?BankersRounding
 */
export const roundHalfEven: RoundingMode = (value) => {
  const rounded = Math.round(value)
  if (!isHalf(value)) {
    return rounded
  }
  return isEven(rounded) ? rounded : rounded - 1
}

/**
 * Round a number with half values to nearest integer closest to zero.
 */
export const roundHalfTowardsZero: RoundingMode = (value) =>
  isHalf(value)
    ? Math.sign(value) * Math.floor(Math.abs(value))
    : Math.round(value)
