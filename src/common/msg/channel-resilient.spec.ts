import { DebugChannel } from './channel-debug'
import { ResillientChannel } from './channel-resilient'

describe('channel-resilient.spec', () => {
  it('should buffer', async () => {
    const rc = new ResillientChannel()
    rc.postMessage('1')

    const d1 = new DebugChannel()
    rc.setChannel(d1)
    expect(d1.messages).toMatchInlineSnapshot(`
      Array [
        "1",
      ]
    `)

    rc.postMessage('2')
    expect(d1.messages).toMatchInlineSnapshot(`
      Array [
        "1",
        "2",
      ]
    `)

    rc.deleteChannel()
    rc.postMessage('3')

    expect(d1.messages).toMatchInlineSnapshot(`
      Array [
        "1",
        "2",
      ]
    `)

    const d2 = new DebugChannel()
    rc.setChannel(d2)
    expect(d2.messages).toMatchInlineSnapshot(`
      Array [
        "3",
      ]
    `)
  })
})
