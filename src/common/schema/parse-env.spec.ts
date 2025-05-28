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
      env: {
        SERVICE_NAME: 'SomeThing',
        SERVICE_PORT: ' 8888 ',
        SERVICE_FLAG: 'illegalValueTriggerDefault',
      },
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
      ServiceName: string().default('generic').props({ desc: 'The name of the service\n  Multi Line  \n\n ' }),
      servicePort: number().default(80).props({ desc: 'The port of the service' }),
      ServiceFlag: boolean().default(true),
      serviceDummy: string().default('dummy').props({ desc: 'Dummy value', envPrivate: true }),
    })

    const env = {
      SERVICE_NAME: 'FormENV',
      SERVICE_PORT: ' 8888 ',
      APP_SERVICE_PORT: ' 9999', // APP_ and without
      SERVICE_FLAG: 'illegalValueTriggerDefault', // invalid value, should trigger default
      APP_SERVICE_DUMMY: 'FromEnvDummyDummyDummy', // only APP_
    }

    // Only those with APP_ prefix should be parsed
    expect(parseSchemaEnv(schema, { env, prefix: 'APP_' })).toMatchInlineSnapshot(`
      Object {
        "ServiceFlag": true,
        "ServiceName": "generic",
        "serviceDummy": "FromEnvDummyDummyDummy",
        "servicePort": 9999,
      }
    `)

    // Also those without APP_ prefix should be parsed, but APP_ prefix wins
    expect(parseSchemaEnv(schema, { env, prefix: 'APP_', prefixOptional: true })).toMatchInlineSnapshot(`
      Object {
        "ServiceFlag": true,
        "ServiceName": "FormENV",
        "serviceDummy": "FromEnvDummyDummyDummy",
        "servicePort": 9999,
      }
    `)

    expect(parseSchemaEnv(schema, { env })).toMatchInlineSnapshot(`
      Object {
        "ServiceFlag": true,
        "ServiceName": "FormENV",
        "serviceDummy": "dummy",
        "servicePort": 8888,
      }
    `)

    expect(stringFromSchemaEnv(schema, 'APP_', false)).toMatchInlineSnapshot(`
      "# The name of the service
      # Multi Line
      APP_SERVICE_NAME=generic

      # The port of the service
      APP_SERVICE_PORT=80

      APP_SERVICE_FLAG=true
      "
    `)
  })
})
