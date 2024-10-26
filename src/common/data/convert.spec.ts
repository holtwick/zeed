import {   valueToBoolean, valueToBooleanNotFalse, valueToInteger, valueToString } from './convert'

describe('convert', () => {
  it('should convert', () => {
    expect(valueToString(123)).toBe('123')

    expect(valueToInteger('123')).toBe(123)
    expect(valueToInteger(true)).toBe(1)
  })
 

  it('should have some bias', async () => {
    expect(valueToBoolean('123')).toBe(false)
    expect(valueToBoolean('1')).toBe(true)
    expect(valueToBoolean('on')).toBe(true)
    expect(valueToBoolean(1)).toBe(true)
    expect(valueToBoolean(123)).toBe(true) // ???
    expect(valueToBoolean(undefined)).toBe(false)
    expect(valueToBoolean(null)).toBe(false)
    expect(valueToBoolean('')).toBe(false)

    expect(valueToBooleanNotFalse('123')).toBe(true)
    expect(valueToBooleanNotFalse('1')).toBe(true)
    expect(valueToBooleanNotFalse('0')).toBe(false)
    expect(valueToBooleanNotFalse('off')).toBe(false)
    expect(valueToBooleanNotFalse(1)).toBe(true)
    expect(valueToBooleanNotFalse(123)).toBe(true)
    expect(valueToBooleanNotFalse(undefined)).toBe(true)
    expect(valueToBooleanNotFalse(null)).toBe(true)
    expect(valueToBooleanNotFalse('')).toBe(true)
  })
})
