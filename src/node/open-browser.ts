// Open URL in default browser on macOS, Linux, and Windows
import { exec } from 'node:child_process'
import { platform } from 'node:os'

export function openBrowser(url: string) {
  switch (platform()) {
    case 'darwin':
      exec(`open -u ${url}`)
      break
    case 'win32':
      exec(`start ${url}`)
      break
    default:
      exec(`xdg-open ${url}`)
  }
}
