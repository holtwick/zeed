import { parseSchemaEnv } from './env'
import { number, object, string } from './schema'

describe('env.spec', () => {
  it('parse env', async () => {
    const schema = object({
      ServiceName: string().default('generic'),
      servicePort: number().default(80),
    })

    const r = parseSchemaEnv(schema, {
      SERVICE_NAME: 'SomeThing',
      SERVICE_PORT: ' 8888 ',
    })

    expect(r).toMatchInlineSnapshot(`
      Object {
        "ServiceName": "SomeThing",
        "servicePort": 8888,
      }
    `)
  })
})
