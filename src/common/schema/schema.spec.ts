import type { Infer } from './schema'
import type { Expect, IsEqual } from './type-test'
import { cloneJsonObject } from '../data'
import { uuid } from '../uuid'
import { schemaParseObject } from './parse-object'
import { any, array, boolean, float, int, literal, number, object, string, stringLiterals, tuple, union } from './schema'
import { z } from './z'

describe('schema', () => {
  it('create schema', async () => {
    // Literals
    type Status = 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    const lit = stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted'])
    type ScheamLiterals = Infer<typeof lit>
    type SchemaLiteralsTest = Expect<IsEqual<ScheamLiterals, Status>> // Should pass
    expectTypeOf<ScheamLiterals>().toMatchTypeOf<Status>()

    // Tuple
    const tup = tuple([number(), string(), boolean()])
    type SchemaTuple = Infer<typeof tup> // expected [number, string, boolean]
    type SchemaTupleTest = Expect<IsEqual<SchemaTuple, [number, string, boolean]>> // Should pass
    expectTypeOf<SchemaTuple>().toMatchTypeOf<[number, string, boolean]>()

    const s1 = string().optional() // .pattern(/\d+/)
    type t1a = typeof s1
    type t1 = Infer<typeof s1>
    expectTypeOf<t1>().toMatchTypeOf<string | undefined>()

    type CustomType = string | number | boolean

    const schema = object({
      id: string().default('123'), // default(() => '123'),
      name: string(),
      age: int().optional(),
      active: boolean(),
      tags: array(string()).optional(),
      info: any(),
      // status: stringLiterals(['active', 'trialing', 'past_due', 'paused', 'deleted']),
      // status: string<Status>(),
      obj: object({
        test: float(),
      }).optional(),
      lit,
      log: any<CustomType>(),
    })

    type Schema = Infer<typeof schema>
    type SchemaTest = Expect<IsEqual<Schema, {
      age?: number | undefined
      tags?: string[] | undefined
      info?: any
      obj?: {
        test: number
      } | undefined
      log: CustomType
      id: string
      name: string
      active: boolean
      lit: 'active' | 'trialing' | 'past_due' | 'paused' | 'deleted'
    }>> // Should pass

    const sample: Omit<Schema, 'id'> = {
      name: 'Hello',
      age: 42,
      active: true,
      lit: 'past_due',
      info: 123,
      log: true,
    }

    // const s: Status = sample.status

    expect(cloneJsonObject(schema)).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "active": Object {
            "type": "boolean",
          },
          "age": Object {
            "_optional": true,
            "type": "int",
          },
          "id": Object {
            "_default": "123",
            "type": "string",
          },
          "info": Object {
            "type": "any",
          },
          "lit": Object {
            "_enumValues": Array [
              "active",
              "trialing",
              "past_due",
              "paused",
              "deleted",
            ],
            "type": "string",
          },
          "log": Object {
            "type": "any",
          },
          "name": Object {
            "type": "string",
          },
          "obj": Object {
            "_object": Object {
              "test": Object {
                "type": "number",
              },
            },
            "_optional": true,
            "type": "object",
          },
          "tags": Object {
            "_optional": true,
            "_type": Object {
              "type": "string",
            },
            "type": "array",
          },
        },
        "type": "object",
      }
    `)

    expect(schemaParseObject(schema, sample)).toMatchInlineSnapshot(`
      Object {
        "active": true,
        "age": 42,
        "id": "123",
        "info": 123,
        "lit": "past_due",
        "log": true,
        "name": "Hello",
      }
    `)

    // expect(schema.map(sample, (v, s) => {
    //   if (s.type === 'boolean') {
    //     return v ? 'on' : 'off'
    //   }
    // })).toMatchInlineSnapshot(`
    //   Object {
    //     "active": "on",
    //     "age": 42,
    //     "info": 123,
    //     "lit": "past_due",
    //     "log": true,
    //     "name": "Hello",
    //     "obj": Object {},
    //   }
    // `)

    // expect(schema.map(sample, function (v) {
    //   if (this.type === 'boolean') {
    //     return v ? 'yes' : 'no'
    //   }
    // })).toMatchInlineSnapshot(`
    //   Object {
    //     "active": "yes",
    //     "age": 42,
    //     "info": 123,
    //     "lit": "past_due",
    //     "log": true,
    //     "name": "Hello",
    //     "obj": Object {},
    //   }
    // `)

    // expect(schema.parse({} as any)).toBe()
  })

  it('union', async () => {
    const literals = [
      literal('one'),
      literal('two'),
      literal('three'),
    ]

    const schema = object({
      id: string().default(() => '123').meta({
        // someProp: 'someValue',
      }),
      literal: literal('demo'),
      name: union(literals),
    })

    type Schema = Infer<typeof schema>

    const sample: Partial<Schema> = {
      literal: 'demo',
      name: 'two',
    }

    expect(cloneJsonObject(schema)).toMatchInlineSnapshot(`
      Object {
        "_object": Object {
          "id": Object {
            "_meta": Object {},
            "type": "string",
          },
          "literal": Object {
            "_default": "demo",
            "type": "literal",
          },
          "name": Object {
            "_union": Array [
              Object {
                "_default": "one",
                "type": "literal",
              },
              Object {
                "_default": "two",
                "type": "literal",
              },
              Object {
                "_default": "three",
                "type": "literal",
              },
            ],
            "type": "union",
          },
        },
        "type": "object",
      }
    `)

    expect(schemaParseObject(schema, sample)).toMatchInlineSnapshot(`
      Object {
        "id": "123",
        "literal": "demo",
      }
    `)
    // expect(schema.parse({} as any)).toBe()
  })

  it('union with object', async () => {
    const obj = union([
      object({ subscription: literal(true), subscriptionId: string() }),
      object({ subscription: literal(false), licenseId: string() }),
    ])
    // type Schema = Infer<typeof obj>
    type Schema = z.infer<typeof obj>
    type SchemaExpected = {
      subscription: true
      subscriptionId: string
    } | {
      subscription: false
      licenseId: string
    }
    type _SchemaTest = Expect<IsEqual<Schema, SchemaExpected>> // Should pass
    expectTypeOf<Schema>().toMatchTypeOf<SchemaExpected>()
  })

  it('mimic extend schema', async () => {
    const baseSchema = z.object({
      id: string().default(uuid),
    })
    const extendedSchema = baseSchema.extend({
      name: string(),
      age: int().optional(),
      active: boolean(),
      tags: array(string()).optional(),
      info: any(),
      description: string().optional(),
    })
    type BaseSchema = Infer<typeof baseSchema>
    type ExtendedSchema = Infer<typeof extendedSchema>
    expectTypeOf<BaseSchema>().toMatchObjectType<{ id: string }>()
    expectTypeOf<ExtendedSchema>().toMatchObjectType<{
      id: string
      age?: number | undefined
      tags?: string[] | undefined
      info?: any
      name: string
      active: boolean
      description?: string | undefined
    }>()
  })

  it('optional and default', async () => {
    const s = z.object({
      def1: z.string().default('hallo'), // not optional!
      def2: z.string().default('hallo').optional(),
      def3: z.string().optional().default('hallo'), // different order
      def4: z.string().optional(),
    })
    type Schema = Infer<typeof s>
    type SchemaTest = Expect<IsEqual<Schema, {
      def1: string
      def2?: string | undefined
      def3?: string | undefined
      def4?: string | undefined
    }>> // Should pass
  })

  describe('object manipulation methods', () => {
    // Test setup - similar to the Recipe example
    const RecipeSchema = object({
      title: string(),
      description: string().optional(),
      ingredients: array(string()),
      published: boolean(),
    })

    expectTypeOf<Infer<typeof RecipeSchema>>().toMatchObjectType<{
      description?: string | undefined
      title: string
      ingredients: string[]
      published: boolean
    }>()

    describe('pick()', () => {
      it('should pick specified keys from object schema', () => {
        const JustTheTitle = RecipeSchema.pick({ title: true })

        // Type should only include title
        expect(JustTheTitle._object).toEqual({
          title: expect.any(Object),
        })
        expect(JustTheTitle._object.title).toBe(RecipeSchema._object.title)

        expectTypeOf<Infer<typeof JustTheTitle>>().toMatchObjectType<{
          title: string
        }>()
      })

      it('should pick multiple keys from object schema', () => {
        const TitleAndIngredients = RecipeSchema.pick({ title: true, ingredients: true })

        expect(TitleAndIngredients._object).toEqual({
          title: expect.any(Object),
          ingredients: expect.any(Object),
        })

        expectTypeOf<Infer<typeof TitleAndIngredients>>().toMatchObjectType<{
          title: string
          ingredients: string[]
        }>()
      })

      it('should throw error when used on non-object schema', () => {
        const stringSchema = string()
        expect(() => stringSchema.pick({ anything: true } as any)).toThrow('pick() can only be used on object schemas')
      })
    })

    describe('omit()', () => {
      it('should omit specified keys from object schema', () => {
        const RecipeNoDescription = RecipeSchema.omit({ description: true })

        // Should have all keys except description
        expect(Object.keys(RecipeNoDescription._object)).toEqual(['title', 'ingredients', 'published'])
        expect(RecipeNoDescription._object.description).toBeUndefined()

        expectTypeOf<Infer<typeof RecipeNoDescription>>().toMatchObjectType<{
          title: string
          ingredients: string[]
          published: boolean
        }>()

        // const x: Infer<typeof RecipeNoDescription> = {
        //   title: 'Test Recipe',
        //   ingredients: ['Flour', 'Sugar'],
        //   published: true,
        //   description: 'This should not be here', // This should cause a type error
        // }
      })

      it('should omit multiple keys from object schema', () => {
        const JustTitleAndPublished = RecipeSchema.omit({ description: true, ingredients: true })

        expect(Object.keys(JustTitleAndPublished._object)).toEqual(['title', 'published'])

        expectTypeOf<Infer<typeof JustTitleAndPublished>>().toMatchObjectType<{
          title: string
          published: boolean
        }>()
      })

      it('should throw error when used on non-object schema', () => {
        const stringSchema = string()
        expect(() => stringSchema.omit({ anything: true } as any)).toThrow('omit() can only be used on object schemas')
      })
    })

    describe('partial()', () => {
      it('should make all properties optional when no keys specified', () => {
        const PartialRecipe = RecipeSchema.partial()

        // All properties should be optional
        expect(PartialRecipe._object.title._optional).toBe(true)
        expect(PartialRecipe._object.description._optional).toBe(true) // was already optional
        expect(PartialRecipe._object.ingredients._optional).toBe(true)
        expect(PartialRecipe._object.published._optional).toBe(true)

        expectTypeOf<Infer<typeof PartialRecipe>>().toMatchObjectType<{
          title?: string
          ingredients?: string[]
          published?: boolean
          description?: string
        }>()
      })

      it('should make only specified properties optional', () => {
        const RecipeOptionalIngredients = RecipeSchema.partial({ ingredients: true })

        // Only ingredients should be made optional, others retain original state
        expect(RecipeOptionalIngredients._object.title._optional).toBeUndefined() // was required, stays required
        expect(RecipeOptionalIngredients._object.description._optional).toBe(true) // was optional, stays optional
        expect(RecipeOptionalIngredients._object.ingredients._optional).toBe(true) // was required, now optional
        expect(RecipeOptionalIngredients._object.published._optional).toBeUndefined() // was required, stays required

        expectTypeOf<Infer<typeof RecipeOptionalIngredients>>().toMatchObjectType<{
          title: string
          description?: string | undefined
          ingredients?: string[] | undefined
          published: boolean
        }>()
      })

      it('should throw error when used on non-object schema', () => {
        const stringSchema = string()
        expect(() => stringSchema.partial()).toThrow('partial() can only be used on object schemas')
      })
    })

    describe('required()', () => {
      it('should make all properties required when no keys specified', () => {
        const RequiredRecipe = RecipeSchema.required()

        // All properties should be required (not optional)
        expect(RequiredRecipe._object.title._optional).toBe(false)
        expect(RequiredRecipe._object.description._optional).toBe(false)
        expect(RequiredRecipe._object.ingredients._optional).toBe(false)
        expect(RequiredRecipe._object.published._optional).toBe(false)

        expectTypeOf<Infer<typeof RequiredRecipe>>().toMatchObjectType<{
          title: string
          ingredients: string[]
          published: boolean
          description: string
        }>()
      })

      it('should make only specified properties required', () => {
        const RecipeRequiredDescription = RecipeSchema.required({ description: true })

        // Only description should be made required, others retain original state
        expect(RecipeRequiredDescription._object.title._optional).toBeUndefined() // was required, stays required
        expect(RecipeRequiredDescription._object.description._optional).toBe(false) // was optional, now required
        expect(RecipeRequiredDescription._object.ingredients._optional).toBeUndefined() // was required, stays required
        expect(RecipeRequiredDescription._object.published._optional).toBeUndefined() // was required, stays required

        expectTypeOf<Infer<typeof RecipeRequiredDescription>>().toMatchObjectType<{
          title: string
          description: string
          ingredients: string[]
          published: boolean
        }>()
      })

      it('should throw error when used on non-object schema', () => {
        const stringSchema = string()
        expect(() => stringSchema.required()).toThrow('required() can only be used on object schemas')
      })
    })
  })
})
