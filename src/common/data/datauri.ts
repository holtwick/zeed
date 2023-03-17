import { fromBase64, toBase64 } from './bin'

export function dataUriToUint8Array(dataUri: string): Uint8Array | undefined {
  if (dataUri.startsWith('data:'))
    return fromBase64(dataUri.split(',', 2)[1])
}

export function dataUriToMimeType(dataUri: string): string | undefined {
  if (dataUri.startsWith('data:'))
    return dataUri.slice(5).split(',', 2)[0]
}

export function dataUriToBlob(dataUri: string): Blob | undefined {
  if (dataUri.startsWith('data:')) {
    const [mimeString, base64String] = dataUri.slice(5).split(',', 2)
    return new Blob([fromBase64(base64String)], { type: mimeString })
  }
}

export async function blobToDataUri(blob: Blob): Promise<string | undefined> {
  const bin = await blob.arrayBuffer()
  if (bin)
    return `data:${blob.type},${toBase64(bin)}`
}

export function Uint8ArrayToDataUri(bin: Uint8Array, type = 'application/octet-stream'): string {
  return `data:${type},${toBase64(bin)}`
}
