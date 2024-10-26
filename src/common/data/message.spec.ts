import { renderMessages } from './message'

describe('message', () => {
 
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
        Number.NaN,
        1e2,
        'string',
      ]),
    ).toEqual(`Message {
  \"a\": 1,
  \"b\": null
} null undefined NaN 100 string`)
  })
 
})
