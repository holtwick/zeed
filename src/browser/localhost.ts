export function isLocalHost(
  hostname: string = window.location.hostname
): boolean {
  return (
    ["localhost", "127.0.0.1", "", "::1"].includes(hostname) ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.0.") ||
    hostname.endsWith(".local")
  )
}
