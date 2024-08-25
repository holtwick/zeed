import { parseSchemaEnv } from './env'
import { boolean, number, object, string } from './schema'

describe('env.spec', () => {
  it('parse env', async () => {
    const schema = object({
      ServiceName: string().default('generic'),
      servicePort: number().default(80),
      ServiceFlag: boolean().default(true),
    })

    const r = parseSchemaEnv(schema, {
      SERVICE_NAME: 'SomeThing',
      SERVICE_PORT: ' 8888 ',
      SERVICE_FLAG: 'illegalValueTriggerDefault',
    })

    expect(r).toMatchInlineSnapshot(`
      Object {
        "ServiceFlag": true,
        "ServiceName": "SomeThing",
        "servicePort": 8888,
      }
    `)
  })

  it('parse prefix', async () => {
    const schema = object({
      ServiceName: string().default('generic'),
      servicePort: number().default(80),
      ServiceFlag: boolean().default(true),
    })

    const r = parseSchemaEnv(schema, {
      SERVICE_NAME: 'SomeThing',
      SERVICE_PORT: ' 8888 ',
      APP_SERVICE_PORT: ' 9999',
      SERVICE_FLAG: 'illegalValueTriggerDefault',
    }, 'APP_')

    expect(r).toMatchInlineSnapshot(`
      Object {
        "ServiceFlag": true,
        "ServiceName": "generic",
        "servicePort": 9999,
      }
    `)
  })
})
