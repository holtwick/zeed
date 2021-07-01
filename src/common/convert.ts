export function stringToBoolean(value?: string, defaultValue = false): boolean {
  if (value == null || typeof value !== "string") return defaultValue
  return ["1", "true", "yes"].includes(value.toLocaleLowerCase())
}

export function stringToInteger(value?: string, defaultValue = 0): number {
  if (value == null || typeof value !== "string") return defaultValue
  return parseInt(value.trim(), 10) ?? defaultValue
}

export function stringToFloat(value?: string, defaultValue = 0.0): number {
  if (value == null || typeof value !== "string") return defaultValue
  return parseFloat(value.trim()) ?? defaultValue
}

export function valueToBoolean(value?: any, defaultValue = false): boolean {
  if (value == null) return defaultValue
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  return ["1", "true", "yes"].includes(value.toString().toLocaleLowerCase())
}

export function valueToInteger(value?: any, defaultValue = 0): number {
  if (value == null) return defaultValue
  if (typeof value === "boolean") return value ? 1 : 0
  if (typeof value === "number") return Math.floor(value)
  return parseInt(value.toString().trim(), 10) ?? defaultValue
}

export function valueToFloat(value?: any, defaultValue = 0.0): number {
  if (value == null) return defaultValue
  if (typeof value === "boolean") return value ? 1 : 0
  if (typeof value === "number") return Math.floor(value)
  return parseFloat(value.toString().trim()) ?? defaultValue
}

export function valueToString(value?: any, defaultValue = ""): string {
  if (value == null) return defaultValue
  // if (value == "") return defaultValue // ???
  return value.toString() ?? defaultValue
}

// export function mapToObject<T>(map: Map<string, T>): { [key: string]: T } {
//   return Object.fromEntries(map)
// }

// export function objectToMap<T>(obj: { [key: string]: T }): Map<string, T> {
//   return new Map(Object.entries(obj))
// }

// Shortcuts

export const toFloat = valueToFloat
export const toInt = valueToInteger
export const toString = valueToString
export const toBool = valueToBoolean

// Strings

// From https://github.com/moll/json-stringify-safe License ISC

type EntryProcessor = (key: string, value: any) => any

function serializer(replacer: EntryProcessor, cycleReplacer?: EntryProcessor) {
  var stack: any[] = [],
    keys: string[] = []

  if (cycleReplacer == null)
    cycleReplacer = function (key, value) {
      if (stack[0] === value) return "[Circular ~]"
      return (
        "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
      )
    }

  return function (this: EntryProcessor, key: string, value: any): any {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
      if (~stack.indexOf(value)) value = cycleReplacer?.call(this, key, value)
    } else stack.push(value)

    return replacer == null ? value : replacer.call(this, key, value)
  }
}

export function stringify(
  obj: any,
  replacer?: EntryProcessor | null,
  spaces?: string | number | null,
  cycleReplacer?: EntryProcessor
): string {
  // @ts-ignore
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}
export type RenderMessagesOptions = {
  trace?: boolean // = true
  pretty?: boolean // = true
}

export function formatMessages(
  messages: any[],
  opt: RenderMessagesOptions = {}
): any[] {
  const { trace = true, pretty = true } = opt
  return messages.map((obj) => {
    if (obj && typeof obj === "object") {
      if (obj instanceof Error) {
        if (!trace) {
          return `${obj.name || "Error"}: ${obj.message}`
        }
        return `${obj.name || "Error"}: ${obj.message}\n${obj.stack}`
      }
      return pretty ? stringify(obj, null, 2) : stringify(obj)
    }
    return String(obj)
  })
}

export function renderMessages(
  messages: any[],
  opt: RenderMessagesOptions = {}
): string {
  return formatMessages(messages, opt).join(" ")
}
