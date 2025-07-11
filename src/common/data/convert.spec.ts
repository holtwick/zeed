import { fixBrokenUtf8String, stringToBoolean, stringToFloat, stringToInteger, toBool, toFloat, toInt, toString, valueToBoolean, valueToBooleanNotFalse, valueToFloat, valueToInteger, valueToString } from './convert'

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

  it('should cover stringToBoolean, stringToInteger, stringToFloat', () => {
    expect(stringToBoolean('yes')).toBe(true)
    expect(stringToBoolean('no')).toBe(false)
    expect(stringToBoolean(undefined, true)).toBe(true)
    expect(stringToBoolean('')).toBe(false)
    expect(stringToInteger('42')).toBe(42)
    expect(stringToInteger('notanumber')).toBe(0)
    expect(stringToInteger(undefined, 5)).toBe(5)
    expect(stringToFloat('3.14')).toBeCloseTo(3.14)
    expect(stringToFloat('notanumber', 2.5)).toBe(2.5)
    expect(stringToFloat(undefined, 1.1)).toBe(1.1)
  })

  it('should cover valueToFloat, valueToString, and shortcuts', () => {
    expect(valueToFloat('3.14')).toBeCloseTo(3.14)
    expect(valueToFloat(true)).toBe(1)
    expect(valueToFloat(false)).toBe(0)
    expect(valueToFloat(2.7)).toBe(2)
    expect(valueToFloat(undefined, 9.9)).toBe(9.9)
    expect(toFloat('2.5')).toBeCloseTo(2.5)
    expect(toInt('42')).toBe(42)
    expect(toString(42)).toBe('42')
    expect(toBool('on')).toBe(true)
  })

  it('should cover fixBrokenUtf8String', () => {
    // Valid UTF-8 string
    expect(fixBrokenUtf8String('hello')).toBe('hello')
    // Broken string (simulate)
    const broken = unescape(encodeURIComponent('✓'))
    expect(fixBrokenUtf8String(broken)).toBe('✓')
    // Should not throw on invalid
    expect(fixBrokenUtf8String('%E0%A4%A')).toBe('%E0%A4%A')
  })
})
