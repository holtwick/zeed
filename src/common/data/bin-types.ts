export type BinInput = Uint8Array | ArrayBuffer | string | number[]

// Use a plain Uint8Array backed by ArrayBuffer to satisfy BufferSource expectations.
// We explicitly specify ArrayBuffer (not ArrayBufferLike) for Web Crypto API compatibility.
export type BinArray = Uint8Array<ArrayBuffer>

// BufferSource is a Web Crypto API type that includes ArrayBuffer and ArrayBufferView types.
// Note: We don't redefine this here to avoid conflicts with the global BufferSource type.
