import { describe, expect, it } from 'vitest'
import { Type } from './schema'
import { isSchemaDefault, isSchemaObject, isSchemaObjectFlat, isSchemaOptional, isSchemaPrimitive } from './utils'

// Helper to create a minimal Type<any> instance with custom properties
function makeType(props: Partial<Type<any>> = {}) {
  return Object.assign(new Type('mock'), props)
}

describe('schema/utils', () => {
  it('isSchemaObject returns true if _object is set', () => {
    expect(isSchemaObject(makeType({ _object: {} }))).toBe(true)
    expect(isSchemaObject(makeType({ _object: null }))).toBe(false)
    expect(isSchemaObject(makeType())).toBe(false)
  })

  it('isSchemaOptional returns true if _optional is true', () => {
    expect(isSchemaOptional(makeType({ _optional: true }))).toBe(true)
    expect(isSchemaOptional(makeType({ _optional: false }))).toBe(false)
    expect(isSchemaOptional(makeType())).toBe(false)
  })

  it('isSchemaDefault returns true if _default is set', () => {
    expect(isSchemaDefault(makeType({ _default: 1 }))).toBe(true)
    expect(isSchemaDefault(makeType({ _default: undefined }))).toBe(false)
    expect(isSchemaDefault(makeType())).toBe(false)
  })

  it('isSchemaPrimitive returns true if not object', () => {
    expect(isSchemaPrimitive(makeType())).toBe(true)
    expect(isSchemaPrimitive(makeType({ _object: {} }))).toBe(false)
  })

  it('isSchemaObjectFlat returns true if all values are primitive', () => {
    const primitive = makeType()
    const obj = makeType({ _object: { a: primitive, b: primitive } })
    expect(isSchemaObjectFlat(obj)).toBe(true)
    const nonPrimitive = makeType({ _object: {} })
    const obj2 = makeType({ _object: { a: primitive, b: nonPrimitive } })
    expect(isSchemaObjectFlat(obj2)).toBe(false)
    expect(isSchemaObjectFlat(makeType())).toBe(false)
  })
})
