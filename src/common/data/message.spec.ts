import { renderMessages } from './message'

describe('message', () => {

  it('should print errors', () => {
    expect(renderMessages(['Message', new Error('Hello')], { trace: false })).toMatchInlineSnapshot(`"Message Error: Hello"`)

    expect(renderMessages(['Message', new Error('Hello')], { trace: false }),).toMatchInlineSnapshot(`"Message Error: Hello"`)

    expect(
      renderMessages([
        'Message',
        { a: 1, b: null },
        null,
        undefined,
        Number.NaN,
        1e2,
        'string',
      ], { trace: false }),
    ).toMatchInlineSnapshot(`
      "Message {
        "a": 1,
        "b": null
      } null undefined NaN 100 string"
    `)

    // it('should handle promise rejection', async () => {
    //   let promise = new Promise((_, reject) => reject(new Error('Hello')))
    //   let myRejectionEvent = new PromiseRejectionEvent("unhandledrejection", {
    //     promise,
    //     reason: "My house is on fire",
    //   })

    //   expect(renderMessages(myRejectionEvent)).toMatchInlineSnapshot()

  })

})
