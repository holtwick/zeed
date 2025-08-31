export type BinInput = Uint8Array | ArrayBuffer | string | number[]

// Use a plain Uint8Array backed by ArrayBuffer to satisfy BufferSource expectations
export type BinArray = Uint8Array
