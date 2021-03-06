// Original taken from https://github.com/scurker/currency.js
// @ts-nocheck

import { arrayFlatten } from "./array"

export type CurrencyInput = number | string | Currency

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
  format?: (currency?: Currency, opts?: CurrencyOptions) => string
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

/** @deprecated use decimal() instead */
export function currency(
  value: CurrencyInput,
  opts: CurrencyOptions = {}
): Currency {
  return new Currency(value, opts)
}

/**
 * Immuteable currency representation
 * @deprecated use decimal() instead
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
