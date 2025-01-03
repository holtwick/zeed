import { isArray, isBinaryArray, isObject, isPrimitive, isSymbol } from './is'

/** Like `.map()` for object. Return new key and value or `undefined` to delete. */
export function objectMap<T = any>(
  obj: any,
  fn: (key: string, value: any) => [key: string, value: T] | T | undefined | null,
): Record<string, T> {
  if (!isObject(obj))
    return {}
  return Object.fromEntries(
    Object.entries(obj)
      .map(([k, v]) => {
        const r = fn(k, v)
        if (isArray(r) && r.length === 2)
          return r
        return [k, r]
      })
      .filter(v => v != null),
  )
}

/** Like `.filter()` for object. */
export function objectFilter<T = any>(
  obj: any,
  fn: (key: string, value: any) => boolean,
): Partial<T> {
  if (!isObject(obj))
    return {}
  return Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(k, v))) as any
}

/** Merge right into left object. If dispose is defined, it will be combined. Left can be a complex object i.e. a insantiated class. */
export function objectMergeDisposable<A extends object, B extends object>(
  a: A,
  b: B,
): A & B {
  // @ts-expect-error xxx
  if (b.dispose && a.dispose) {
    // @ts-expect-error xxx
    b.dispose.add(a.dispose)
  }
  return Object.assign(a, b)
}

// export function objectMerge<A, B>(a: A, b: B): A & B {
//   return Object.assign({}, a, b)
// }

export function objectIsEmpty(obj: object) {
  return Object.keys(obj).length <= 0
}

// https://stackoverflow.com/a/56592365/140927
export function objectPick<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
  return Object.fromEntries(keys.filter(key => key in obj).map(key => [key, obj[key]])) as Pick<T, K>
}

export function objectInclusivePick<T extends object, K extends (string | number | symbol)>(obj: T, ...keys: K[]) {
  return Object.fromEntries(keys.map(key => [key, obj[key as unknown as keyof T]])) as { [key in K]: key extends keyof T ? T[key] : undefined }
}

export function objectOmit<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key as K))) as Omit<T, K>
}

/// Convert object to plain object with max depth.
export function objectPlain(obj: any, opt?: {
  maxDepth?: number
  maxDepthValue?: any
  circleValue?: any
  errorTrace?: boolean
  filter?: (value: any) => boolean
  keepAsIs?: (value: any) => boolean
  transformer?: (value: any) => any | undefined
}): any {
  const {
    maxDepth = 99,
    circleValue,
    maxDepthValue,
    errorTrace = true,
    filter = () => true,
    keepAsIs = () => false,
    transformer = () => undefined,
  } = opt ?? {}

  const cycle: any = []

  function handleObject(obj: any, depth: number): any {
    if (depth > maxDepth)
      return maxDepthValue // '*** MAX DEPTH ***'

    if (keepAsIs(obj))
      return obj

    if (!isPrimitive(obj)) {
      if (cycle.includes(obj))
        return circleValue // '*** CYCLE ***'
      cycle.push(obj)
    }

    if (transformer) {
      const result = transformer(obj)
      if (result !== undefined)
        return result
    }

    if (isSymbol(obj))
      return String(obj)

    if (isPrimitive(obj))
      return obj

    if (typeof Date !== 'undefined' && obj instanceof Date) {
      return {
        __class: 'Date',
        value: obj.toISOString(),
      }
    }

    if (typeof RegExp !== 'undefined' && obj instanceof RegExp) {
      return {
        __class: 'RegExp',
        source: obj.toString(),
      }
    }

    if (typeof Map !== 'undefined' && obj instanceof Map)
      obj = Object.fromEntries(obj)

    if (typeof Set !== 'undefined' && obj instanceof Set || isBinaryArray(obj))
      obj = Array.from(obj as any)

    if (typeof ErrorEvent !== 'undefined' && obj instanceof ErrorEvent) {
      return {
        __class: 'ErrorEvent',
        message: obj.message,
        filename: obj.filename,
        lineno: obj.lineno,
        colno: obj.colno,
        error: obj.error ? handleObject(obj.error, depth + 1) : undefined,
      }
    }

    if (typeof Event !== 'undefined' && obj instanceof Event) {
      return {
        __class: 'Event',
        type: obj.type,
        eventPhase: obj.eventPhase,
        bubbles: obj.bubbles,
        cancelable: obj.cancelable,
        defaultPrevented: obj.defaultPrevented,
        composed: obj.composed,
        timeStamp: obj.timeStamp,
      }
    }

    if (typeof Error !== 'undefined' && obj instanceof Error) {
      return {
        __class: 'Error',
        name: obj.name,
        message: obj.message,
        stack: errorTrace ? obj.stack : undefined,
        cause: (obj as any).cause ? String((obj as any).cause) : undefined,
      }
    }
    // return `${obj.name || 'Error'}: ${obj.message}${errorTrace ? `\n${obj.stack}` : ''}`

    /* if (obj instanceof Element) {
      const attrs = obj.getAttributeNames().map(name => `${name}="${String(obj.getAttribute(name))}"`).join(' ')
      return `<${[obj.tagName.toLocaleLowerCase(), ...attrs].join(' ')}}>`
    }  */

    if (Array.isArray(obj)) {
      return obj
        .filter(filter)
        .map(o => handleObject(o, depth + 1))
    }

    // For class objects just dump the first level of primitives
    const objName = obj?.constructor?.name
    if (objName && objName !== 'Object') {
      const nobj: any = {
        __class: objName,
        // __code: obj.toString ? obj.toString() : undefined,
      }
      for (const k in obj) {
        if (obj && obj.hasOwnProperty(k) && isPrimitive(obj[k]))
          nobj[k] = obj[k]
      }
      return nobj
    }

    // Plain objects are recursively dumped
    const nobj: any = {}
    for (const key in obj) {
      const value = obj[key]
      if (filter(value))
        nobj[key] = handleObject(value, depth + 1)
    }
    return nobj

    // return undefined
  }

  return handleObject(obj, 0)
}
