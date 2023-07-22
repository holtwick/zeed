// Why FNV-1a (32-bit) https://softwareengineering.stackexchange.com/a/250750/366573
// A simple implementation https://gist.github.com/vaiorabbit/5657561
// This implementation  https://github.com/tjwebb/fnv-plus/blob/master/index.js#L341
// Alternative implementation https://github.com/sindresorhus/fnv1a

export function stringHashFNV1a(str: string): number {
  const l = str.length
  let c: number
  let i: number
  let t0 = 0
  let v0 = 0x9DC5
  let t1 = 0
  let v1 = 0x811C

  for (i = 0; i < l; i++) {
    c = str.charCodeAt(i)
    if (c < 128) {
      v0 ^= c
    }
    else if (c < 2048) {
      v0 ^= (c >> 6) | 192
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    }
    else if (((c & 64512) === 55296) && (i + 1) < l && ((str.charCodeAt(i + 1) & 64512) === 56320)) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023)
      v0 ^= (c >> 18) | 240
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 12) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 6) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    }
    else {
      v0 ^= (c >> 12) | 224
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= ((c >> 6) & 63) | 128
      t0 = v0 * 403
      t1 = v1 * 403
      t1 += v0 << 8
      v1 = (t1 + (t0 >>> 16)) & 65535
      v0 = t0 & 65535
      v0 ^= (c & 63) | 128
    }
    t0 = v0 * 403
    t1 = v1 * 403
    t1 += v0 << 8
    v1 = (t1 + (t0 >>> 16)) & 65535
    v0 = t0 & 65535
  }

  return ((v1 << 16) >>> 0) + v0
}
