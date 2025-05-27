import type { Infer } from './schema'
import { parseSchemaEnv, stringFromSchemaEnv } from './parse-env'
import { boolean, number, object, string } from './schema'

describe('env.spec', () => {
  it('parse env', async () => {
    const schema = object({
      ServiceName: string().default('generic'),
      servicePort: number().default(80),
      ServiceFlag: boolean().default(true),
    })

    type t = Infer<typeof schema>
    expectTypeOf<t>().toMatchObjectType<{
      ServiceName: string
      servicePort: number
      ServiceFlag: boolean
    }>()

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
      ServiceName: string().default('generic').props({ desc: 'The name of the service' }),
      servicePort: number().default(80).props({ desc: 'The port of the service' }),
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

    expect(stringFromSchemaEnv(schema, 'APP_', true)).toMatchInlineSnapshot(`
      "# The name of the service
      # APP_SERVICE_NAME=generic

      # The port of the service
      # APP_SERVICE_PORT=80

      # APP_SERVICE_FLAG=true
      "
    `)
  })
})
