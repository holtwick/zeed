// From https://github.com/moll/json-stringify-safe License ISC

const _sortedReplacer: EntryProcessor = (key: string, value: any) =>
  (value instanceof Object && !(Array.isArray(value)))
    ? Object.keys(value)
      .sort()
      // .filter((key) => value[key] != null) // Remove null and undefined
      .reduce((sorted: any, key: string) => {
        // Sorted copy
        sorted[key] = value[key]
        return sorted
      }, {})
    : value

// https://gist.github.com/davidfurlong/463a83a33b70a3b6618e97ec9679e490
export function jsonStringifySorted(
  obj: any,
  indent: number | undefined = undefined,
) {
  return JSON.stringify(obj, _sortedReplacer, indent)
}

//

type EntryProcessor = (key: string, value: any) => any

function serializer(replacer?: EntryProcessor, cycleReplacer?: EntryProcessor) {
  const stack: any[] = []
  const keys: string[] = []

  if (cycleReplacer == null) {
    cycleReplacer = function (_key, value) {
      if (stack[0] === value)
        return '[Circular ~]'
      return (
        `[Circular ~.${keys.slice(0, stack.indexOf(value)).join('.')}]`
      )
    }
  }

  return function (this: EntryProcessor, key: string, value: any): any {
    if (stack.length > 0) {
      const thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value))
        value = cycleReplacer?.call(this, key, value)
    }
    else {
      stack.push(value)
    }

    try {
      return replacer == null ? value : replacer.call(this, key, value)
    }
    catch (err) { }
    return String(value)
  }
}

/**
 * Similar to JSON.stringify but can handle circular references.
 * NOT SORTED!
 * From https://github.com/moll/json-stringify-safe/blob/master/stringify.js
 * License ISC
 */
export function jsonStringifySafe(
  obj: any,
  replacer?: EntryProcessor | null | undefined,
  spaces?: string | number | null,
  cycleReplacer?: EntryProcessor,
): string {
  return JSON.stringify(
    obj,
    serializer(replacer ?? undefined, cycleReplacer),
    spaces ?? undefined)
}

export const jsonStringify = jsonStringifySafe

//

// From https://github.com/unjs/destr MIT
// https://github.com/fastify/secure-json-parse
// https://github.com/hapijs/bourne
const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/

const JsonSigRx = /^["{[]|^-?[0-9][0-9.]{0,14}$/

function jsonParseTransform(key: string, value: any): any {
  if (key === '__proto__' || key === 'constructor')
    return

  return value
}

export default function jsonParse(val: string): any {
  if (typeof val !== 'string')
    return val

  const _lval = val.toLowerCase()
  if (_lval === 'true')
    return true

  if (_lval === 'false')
    return false

  if (_lval === 'null')
    return null

  if (_lval === 'nan')
    return NaN

  if (_lval === 'infinity')
    return Infinity

  if (_lval === 'undefined')
    return undefined

  if (!JsonSigRx.test(val))
    return val

  try {
    if (suspectProtoRx.test(val) || suspectConstructorRx.test(val))
      return JSON.parse(val, jsonParseTransform)

    return JSON.parse(val)
  }
  catch (_e) {
    return val
  }
}
