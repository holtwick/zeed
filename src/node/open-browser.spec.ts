import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { describe, expect, it, vi } from 'vitest'
import { openBrowser } from './open-browser'

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

vi.mock('node:os', () => ({
  platform: vi.fn(),
}))

describe('openBrowser', () => {
  it('should open URL on macOS', () => {
    vi.mocked(platform).mockReturnValue('darwin')
    openBrowser('http://example.com')
    expect(exec).toHaveBeenCalledWith('open http://example.com')
  })

  it('should open URL on Windows', () => {
    vi.mocked(platform).mockReturnValue('win32')
    openBrowser('http://example.com')
    expect(exec).toHaveBeenCalledWith('start http://example.com')
  })

  it('should open URL on Linux', () => {
    vi.mocked(platform).mockReturnValue('linux')
    openBrowser('http://example.com')
    expect(exec).toHaveBeenCalledWith('xdg-open http://example.com')
  })

  // it('should open URL on unknown platform for real', () => {
  //   openBrowser('http://example.com')
  // })
})
