// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { renderMessages, valueToInteger, valueToString } from './convert'

describe('convert', () => {
  it('should convert', () => {
    expect(valueToString(123)).toBe('123')

    expect(valueToInteger('123')).toBe(123)
    expect(valueToInteger(true)).toBe(1)
  })

  it('should print errors', () => {
    expect(renderMessages(['Message', new Error('Hello')])).toContain(
      'Message Error: Hello',
    )
    expect(
      renderMessages(['Message', new Error('Hello')], { trace: false }),
    ).toBe('Message Error: Hello')
    expect(
      renderMessages([
        'Message',
        { a: 1, b: null },
        null,
        undefined,
        NaN,
        1e2,
        'string',
      ]),
    ).toEqual(`Message {
  \"a\": 1,
  \"b\": null
} null undefined NaN 100 string`)
  })
})
