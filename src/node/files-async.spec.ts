import { filesAsync, getFingerprintAsync, getStatAsync } from './files-async'

describe('getStatAsync', () => {
  it('should return the stat object for a valid path', async () => {
    const path = __filename
    const statObject = await getStatAsync(path)
    expect(statObject).toBeDefined()
    expect(statObject!.isFile()).toBe(true)
  })

  it('should return undefined for an invalid path', async () => {
    const path = '/invalid/path'
    const statObject = await getStatAsync(path)
    expect(statObject).toBeUndefined()
  })

  it('should return the fingerprint for a valid path', async () => {
    const path = __filename
    const fingerprint = await getFingerprintAsync(path)
    expect(fingerprint).toBeDefined()
    expect(typeof fingerprint).toBe('string')
  })

  it('should return undefined for an invalid path 2', async () => {
    const path = '/invalid/path'
    const fingerprint = await getFingerprintAsync(path)
    expect(fingerprint).toBeUndefined()
  })

  it('should return an array of file paths', async () => {
    const paths = await filesAsync({ basePath: __dirname })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBeGreaterThan(0)
    expect(typeof paths[0]).toBe('string')
  })

  it('should return an array of file paths matching the pattern', async () => {
    const pattern = '*.ts'
    const paths = await filesAsync({ basePath: __dirname, pattern })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBeGreaterThan(0)
    expect(typeof paths[0]).toBe('string')
    expect(paths.every(path => path.endsWith('.ts'))).toBe(true)
  })

  it('should return an empty array if no files match the pattern', async () => {
    const pattern = '*.docx'
    const paths = await filesAsync({ basePath: __dirname, pattern })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBe(0)
  })

  it('should return an array of file paths filtered by the custom filter function', async () => {
    const filter = (name: string) => name.includes('spec')
    const paths = await filesAsync({ basePath: __dirname, filter })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBeGreaterThan(0)
    expect(typeof paths[0]).toBe('string')
    expect(paths.every(path => path.includes('spec'))).toBe(true)
  })

  it('should return an empty array if no files pass the custom filter function', async () => {
    const filter = (name: string) => name.includes('xyz')
    const paths = await filesAsync({ basePath: __dirname, filter })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.length).toBe(0)
  })

  it('should ignore hidden files by default', async () => {
    const paths = await filesAsync({ basePath: __dirname })
    expect(Array.isArray(paths)).toBe(true)
    expect(paths.every(path => !path.includes('/.'))).toBe(true)
  })

  // it('should include hidden files if ignoreHidden is set to false', async () => {
  //   const paths = await filesAsync({ basePath: resolve(__dirname, '..', '..'), ignoreHidden: false })
  //   expect(Array.isArray(paths)).toBe(true)
  //   expect(paths.some(path => path.includes('/.'))).toBe(true)
  // })
})
