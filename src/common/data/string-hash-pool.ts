import { stringHashFNV1a } from './string-hash-fnv'

export function useStringHashPool() {
  const hashToString: Map<number, string> = new Map()
  const stringToHash: Map<string, number> = new Map()

  function hash(s: string) {
    let v: number | undefined = stringToHash.get(s)
    if (v == null) {
      v = stringHashFNV1a(s)
      if (hashToString.has(v))
        throw new Error(`Hash for '${s}' is already in use for '${hashToString.get(v)}`)
      hashToString.set(v, s)
      stringToHash.set(s, v)
    }
    return v
  }

  function stringForHash(v: number) {
    return hashToString.get(v)
  }

  return {
    hash,
    stringForHash,
  }
}

export type UseStringHashPool = ReturnType<typeof useStringHashPool>
