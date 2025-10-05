# Schema Serialization Demo

This demo demonstrates how to serialize and deserialize schema types to/from JSON format.

## What it demonstrates

- Converting schema definitions to plain JSON objects
- Sending schemas over the network (as JSON strings)
- Reconstructing schemas from JSON
- Round-trip serialization (schema → JSON → schema)
- Working with complex nested schemas

## Use Cases

Schema serialization is useful for:

1. **API Documentation**: Send schema definitions to clients for validation
2. **Remote Validation**: Share validation rules between client and server
3. **Database Storage**: Store schema definitions in databases
4. **Configuration**: Define schemas in JSON configuration files
5. **Code Generation**: Generate code from serialized schemas

## Running the demo

```bash
pnpm install
pnpm start
```

Or with tsx:

```bash
npx tsx index.ts
```

## Key Functions

- `serializeSchema(schema)` - Converts a Type schema to a plain JSON object
- `deserializeSchema(json)` - Reconstructs a Type schema from a JSON object

## Limitations

- Function-based default values (e.g., `.default(() => 'value')`) cannot be serialized
- Custom validation functions are not preserved (standard validators are restored)
- Only static, JSON-serializable values are maintained

## Example Output

The demo will show:

1. The original schema structure
2. The serialized JSON representation
3. The deserialized schema (identical to the original)
4. Round-trip verification
5. Complex nested schema serialization
