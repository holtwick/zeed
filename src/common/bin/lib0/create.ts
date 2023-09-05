/**
 * Original at https://github.com/dmonad/lib0
 *
 * Utility functions to work with buffers (Uint8Array).
 */

/**
 * Create Uint8Array with initial content from buffer
 */
export function createUint8ArrayViewFromArrayBuffer(buffer: ArrayBuffer, byteOffset: number, length: number) {
  return new Uint8Array(buffer, byteOffset, length)
}

/**
 * Create Uint8Array with initial content from buffer
 */
export function createUint8ArrayFromArrayBuffer(buffer: ArrayBuffer) {
  return new Uint8Array(buffer)
}
