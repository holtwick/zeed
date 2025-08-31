// Original from https://github.com/AsyncBanana/microdiff MIT
// Alternative https://github.com/kpdecker/jsdiff

export type DifferenceType = 'new' | 'upd' | 'del'

export interface Difference {
  type: DifferenceType
  path: (string | number)[]
  value?: any
}

export interface DiffOptions {
  cyclesFix: boolean
}

/**
 * Describes the changes between to object with a list like:
 *
 * ```
 * [{
 *    type: 'upd',
 *    path: ['a'],
 *    value: 1
 * },
 * {
 *    type: 'del',
 *    path: ['b', 'c']
 * }
 * ...]
 * ```
 */
export function diffObjects(
  obj: Record<string, any> | any[],
  newObj: Record<string, any> | any[],
  options: Partial<DiffOptions> = { cyclesFix: true },
  _stack: Record<string, any>[] = [],
): Difference[] {
  let diffs: Difference[] = []
  const isObjArray = Array.isArray(obj)

  for (const key in obj) {
    const objValue = (obj as any)[key] // works for both array and record, only TS doesn't know ;)
    const path = isObjArray ? +key : key
    if (!(key in newObj)) {
      diffs.push({
        type: 'del',
        path: [path],
      })
      continue
    }
    const newValue = (newObj as any)[key]
    const areObjects = typeof objValue === 'object' && typeof newValue === 'object'
    if (objValue
      && newValue
      && areObjects
      && !(['Date', 'RegExp', 'String', 'Number'].includes(Object.getPrototypeOf(objValue).constructor.name))
      && (options.cyclesFix ? !_stack.includes(objValue) : true)
    ) {
      const nestedDiffs = diffObjects(
        objValue,
        newValue,
        options,
        options.cyclesFix ? _stack.concat([objValue]) : [],
      )
      diffs = [...diffs, ...nestedDiffs.map((difference) => {
        difference.path.unshift(path)
        return difference
      })]
    }
    else if (
      objValue !== newValue
      && !(
        areObjects
        && (Number.isNaN(objValue)
          ? `${objValue}` === `${newValue}`
          : +objValue === +newValue)
      )
    ) {
      diffs.push({
        path: [path],
        type: 'upd',
        value: newValue,
      })
    }
  }

  const isNewObjArray = Array.isArray(newObj)
  for (const key in newObj) {
    if (!(key in obj)) {
      diffs.push({
        type: 'new',
        path: [isNewObjArray ? +key : key],
        value: (newObj as any)[key], // works for both array and record, only TS doesn't know ;)
      })
    }
  }
  return diffs
}
