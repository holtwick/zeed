import { resolve } from 'node:path'
import { files, walkSync } from './files'

describe('files.spec', () => {
  it('should fetch some', async () => {
    const result = walkSync(__dirname)

    expect(result).toMatchInlineSnapshot(`
      Array [
        "args.spec.ts",
        "args.ts",
        "clipboard.ts",
        "crypto.ts",
        "env.spec.ts",
        "env.ts",
        "files-async.spec.ts",
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
        "log/index.ts",
        "log/log-context-node.ts",
        "log/log-file.spec.ts",
        "log/log-file.ts",
        "log/log-node.spec.ts",
        "log/log-node.ts",
        "log/log-util.spec.ts",
        "log/log-util.ts",
        "open-browser.spec.ts",
        "open-browser.ts",
      ]
    `)
  })

  it('should fetch some 2', async () => {
    const result = files({
      basePath: __dirname,
      pattern: 'files*.spec.ts',
    })

    expect(result).toMatchInlineSnapshot(`
      Array [
        "files-async.spec.ts",
        "files.spec.ts",
        "filestorage.spec.ts",
      ]
    `)
  })

  it('should fetch some subfolders', async () => {
    const basePath = resolve(__dirname, '..')
    expect(basePath).not.toBeNull()

    const result = files({
      basePath,
      pattern: '*/log-*.ts',
    })

    expect(result).toMatchInlineSnapshot(`
      Array [
        "browser/log/log-browser-factory.ts",
        "browser/log/log-browser.ts",
        "browser/log/log-colors.ts",
        "browser/log/log-context-browser.ts",
        "common/log/log-base.ts",
        "common/log/log-colors.ts",
        "common/log/log-config.ts",
        "common/log/log-console-capture.ts",
        "common/log/log-console-original.ts",
        "common/log/log-console.ts",
        "common/log/log-context.ts",
        "common/log/log-filter.spec.ts",
        "common/log/log-filter.ts",
        "common/log/log-memory.spec.ts",
        "common/log/log-memory.ts",
        "common/log/log-noop.ts",
        "node/log/log-context-node.ts",
        "node/log/log-file.spec.ts",
        "node/log/log-file.ts",
        "node/log/log-node.spec.ts",
        "node/log/log-node.ts",
        "node/log/log-util.spec.ts",
        "node/log/log-util.ts",
      ]
    `)
  })
})
