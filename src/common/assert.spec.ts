import { describe, expect, it } from 'vitest'
import { assert, assertCondition, fatal } from './assert'

describe('assert.ts', () => {
  describe('fatal', () => {
    it('should throw an error with the correct message', () => {
      expect(() => fatal('test message')).toThrow('test message')
    })
  })

  describe('assert', () => {
    it('should throw an error when the condition is falsy', () => {
      expect(() => assert(false, 'condition is false')).toThrow('condition is false')
      expect(() => assert(null, 'condition is null')).toThrow('condition is null')
      expect(() => assert(Number.NaN, 'condition is NaN')).toThrow('condition is NaN')
    })

    it('should not throw an error when the condition is truthy', () => {
      expect(() => assert(true, 'condition is true')).not.toThrow()
      expect(() => assert(1, 'condition is 1')).not.toThrow()
      expect(() => assert('non-empty string', 'condition is non-empty string')).not.toThrow()
    })
  })

  describe('assertCondition', () => {
    it('should behave the same as assert', () => {
      expect(() => assertCondition(false, 'condition is false')).toThrow('condition is false')
      expect(() => assertCondition(true, 'condition is true')).not.toThrow()
    })
  })
})
