// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export function isLocalHost(
  hostname: string = globalThis?.location?.hostname ?? ""
): boolean {
  return (
    ["::ffff:127.0.0.1", "localhost", "127.0.0.1", "", "::1", "::"].includes(
      hostname
    ) ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.0.") ||
    hostname.endsWith(".local")
  )
}
