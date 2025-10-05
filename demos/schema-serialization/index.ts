/* eslint-disable no-console */

/**
 * Schema Serialization Demo
 *
 * This demo shows how to serialize and deserialize schema types to/from JSON.
 * This is useful for:
 * - Sending schema definitions over the network
 * - Storing schemas in databases
 * - Sharing schemas between different systems
 */

import { array, deserializeSchema, int, object, serializeSchema, string, z } from 'zeed'

// Define a user schema
const userSchema = z.object({
  id: z.string().default('auto-generated'),
  name: z.string().describe('Full name of the user'),
  email: z.string(),
  age: z.int().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  tags: z.array(z.string()).optional(),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }).optional(),
})

console.log('Original schema:')
console.log(userSchema)

// Serialize the schema to a plain JSON object
const serialized = serializeSchema(userSchema)
console.log('\nSerialized schema:')
console.log(JSON.stringify(serialized, null, 2))

// Convert to JSON string (as you might send over network)
const jsonString = JSON.stringify(serialized)
console.log('\nJSON string length:', jsonString.length)

// Deserialize back to a schema
const deserialized = deserializeSchema(JSON.parse(jsonString))
console.log('\nDeserialized schema:')
console.log(deserialized)

// Use the deserialized schema to validate data
const userData = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  age: 30,
  role: 'admin',
  tags: ['developer', 'typescript'],
}

console.log('\nValidating data with deserialized schema:')
console.log('Input:', userData)

// Note: You would use a parsing function here when available
// For now, we can just verify the schema structure is correct
console.log('Schema type:', deserialized.type)
console.log('Schema has object definition:', !!deserialized._object)
console.log('Name field type:', deserialized._object.name.type)
console.log('Role field enum values:', deserialized._object.role._enumValues)
console.log('Age field is optional:', deserialized._object.age._optional)

// Demonstrate round-trip serialization
const reserialized = serializeSchema(deserialized)
const areEqual = JSON.stringify(serialized) === JSON.stringify(reserialized)
console.log('\nRound-trip successful:', areEqual)

// Example of a complex nested schema
const apiResponseSchema = object({
  success: z.boolean(),
  data: z.object({
    users: array(userSchema),
    total: int(),
  }),
  error: string().optional(),
})

console.log('\n--- Complex Schema Example ---')
const complexSerialized = serializeSchema(apiResponseSchema)
console.log('Complex schema serialized:')
console.log(JSON.stringify(complexSerialized, null, 2))

const complexDeserialized = deserializeSchema(complexSerialized)
console.log('\nComplex schema deserialized successfully:', complexDeserialized.type === 'object')
