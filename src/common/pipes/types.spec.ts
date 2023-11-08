import type { Pipe } from './types'

describe('types.spec', () => {
  it.skip('should pipe', async () => {
    const p1: Pipe<object, string> = {
      post(s) { }, // todo
      on: (fn) => { }, // todo
      serialize(o) {
        return JSON.stringify(o)
      },
      deserialize(s) {
        return JSON.parse(s)
      },
    }

    async function echo(pipe: Pipe<any, any>, o: object) {
      let resolve: any
      pipe.on(fn => resolve = fn)
      pipe.post(o)
      return new Promise(resolve)
    }

    const x = await echo(p1, { a: 1 })
    expect(x).toMatchInlineSnapshot()
  })
})
