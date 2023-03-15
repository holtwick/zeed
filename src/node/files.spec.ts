import { files, walkSync } from './files'

describe('files.spec', () => {
  it('should fetch some', async () => {
    const result = walkSync(__dirname)

    expect(result).toMatchInlineSnapshot( `
      Array [
        "args.spec.ts",
        "args.ts",
        "clipboard.ts",
        "crypto.ts",
        "env.spec.ts",
        "env.ts",
        "files-async.ts",
        "files.spec.ts",
        "files.ts",
        "filestorage.spec.ts",
        "filestorage.ts",
        "fs.spec.ts",
        "fs.ts",
        "glob.spec.ts",
        "glob.ts",
        "index.ts",
        "log-context-node.ts",
        "log-file.spec.ts",
        "log-file.ts",
        "log-node.spec.ts",
        "log-node.ts",
        "log-util.spec.ts",
        "log-util.ts",
      ]
    `)
  })

  it('should fetch some', async () => {
    const result = files({
      basePath: __dirname,
      pattern: 'files*.spec.ts',
    })

    expect(result).toMatchInlineSnapshot(`
      Array [
        "files.spec.ts",
        "filestorage.spec.ts",
      ]
    `)
  })
})
