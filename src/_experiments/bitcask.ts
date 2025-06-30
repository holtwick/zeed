// Bitcask-inspired key-value store (minimal, single-process, single-writer)
// Copyright 2024
import * as fs from 'fs'
import * as path from 'path'
import { FileHandle, open as openFile } from 'fs/promises'

const ENTRY_HEADER_SIZE = 17 // 4 (key) + 4 (value) + 1 (tombstone) + 8 (timestamp)

interface KeyDirEntry {
  fileId: number
  offset: number
  size: number
  timestamp: bigint
  tombstone: boolean
}

export class Bitcask {
  private dirname: string
  private readWrite: boolean
  private syncOnPut: boolean
  private keydir: Map<string, KeyDirEntry> = new Map();
  private activeFile: fs.WriteStream | null = null;
  private activeFileId: number = 0;
  private activeOffset: number = 0;
  private openFiles: Map<number, FileHandle> = new Map();

  constructor(dirname: string, opts: { readWrite?: boolean; syncOnPut?: boolean } = {}) {
    this.dirname = dirname
    this.readWrite = opts.readWrite !== false
    this.syncOnPut = opts.syncOnPut === true
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true })
    this.loadFiles()
    if (this.readWrite) this.rollover()
  }

  private listDataFiles(): string[] {
    return fs.readdirSync(this.dirname).filter(f => f.endsWith('.data')).sort()
  }

  private loadFiles() {
    for (const fname of this.listDataFiles()) {
      const fileId = parseInt(fname.split('.')[0], 10)
      const filePath = path.join(this.dirname, fname)
      const fd = fs.openSync(filePath, 'r')
      let offset = 0
      while (true) {
        const header = Buffer.alloc(ENTRY_HEADER_SIZE)
        const bytesRead = fs.readSync(fd, header, 0, ENTRY_HEADER_SIZE, offset)
        if (bytesRead < ENTRY_HEADER_SIZE) break
        const keySize = header.readUInt32BE(0)
        const valueSize = header.readUInt32BE(4)
        const tombstone = header.readUInt8(8) === 1
        const timestamp = header.readBigUInt64BE(9)
        const key = Buffer.alloc(keySize)
        fs.readSync(fd, key, 0, keySize, offset + ENTRY_HEADER_SIZE)
        // skip value
        const entrySize = ENTRY_HEADER_SIZE + keySize + valueSize
        this.keydir.set(key.toString('binary'), {
          fileId,
          offset,
          size: entrySize,
          timestamp,
          tombstone,
        })
        offset += entrySize
      }
      fs.closeSync(fd)
    }
  }

  private rollover() {
    const fileIds = this.listDataFiles().map(f => parseInt(f.split('.')[0], 10))
    const nextId = fileIds.length ? Math.max(...fileIds) + 1 : 1
    const fname = `${nextId.toString().padStart(8, '0')}.data`
    const filePath = path.join(this.dirname, fname)
    this.activeFile = fs.createWriteStream(filePath, { flags: 'a' })
    this.activeFileId = nextId
    this.activeOffset = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
  }

  async put(key: string | Buffer, value: string | Buffer) {
    if (!this.readWrite) throw new Error('Read-only mode')
    const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(key)
    const valueBuf = Buffer.isBuffer(value) ? value : Buffer.from(value)
    const timestamp = BigInt(Date.now())
    const tombstone = 0
    const header = Buffer.alloc(ENTRY_HEADER_SIZE)
    header.writeUInt32BE(keyBuf.length, 0)
    header.writeUInt32BE(valueBuf.length, 4)
    header.writeUInt8(tombstone, 8)
    header.writeBigUInt64BE(timestamp, 9)
    const entry = Buffer.concat([header, keyBuf, valueBuf])
    const offset = this.activeOffset
    await new Promise<void>((resolve, reject) => {
      this.activeFile!.write(entry, err => (err ? reject(err) : resolve()))
    })
    if (this.syncOnPut && this.activeFile) {
      fs.fsyncSync((this.activeFile as any).fd)
    }
    this.keydir.set(keyBuf.toString('binary'), {
      fileId: this.activeFileId,
      offset,
      size: entry.length,
      timestamp,
      tombstone: false,
    })
    this.activeOffset += entry.length
    if (this.activeOffset > 32 * 1024 * 1024) {
      this.activeFile!.close()
      this.rollover()
    }
  }

  async get(key: string | Buffer): Promise<Buffer | null> {
    const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(key)
    const meta = this.keydir.get(keyBuf.toString('binary'))
    if (!meta || meta.tombstone) return null
    let fh = this.openFiles.get(meta.fileId)
    if (!fh) {
      const fname = path.join(this.dirname, `${meta.fileId.toString().padStart(8, '0')}.data`)
      fh = await openFile(fname, 'r')
      this.openFiles.set(meta.fileId, fh)
    }
    const header = Buffer.alloc(ENTRY_HEADER_SIZE)
    await fh.read(header, 0, ENTRY_HEADER_SIZE, meta.offset)
    const keySize = header.readUInt32BE(0)
    const valueSize = header.readUInt32BE(4)
    const keyRead = Buffer.alloc(keySize)
    await fh.read(keyRead, 0, keySize, meta.offset + ENTRY_HEADER_SIZE)
    const value = Buffer.alloc(valueSize)
    await fh.read(value, 0, valueSize, meta.offset + ENTRY_HEADER_SIZE + keySize)
    return value
  }

  async delete(key: string | Buffer) {
    if (!this.readWrite) throw new Error('Read-only mode')
    const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(key)
    const timestamp = BigInt(Date.now())
    const tombstone = 1
    const header = Buffer.alloc(ENTRY_HEADER_SIZE)
    header.writeUInt32BE(keyBuf.length, 0)
    header.writeUInt32BE(0, 4)
    header.writeUInt8(tombstone, 8)
    header.writeBigUInt64BE(timestamp, 9)
    const entry = Buffer.concat([header, keyBuf])
    const offset = this.activeOffset
    await new Promise<void>((resolve, reject) => {
      this.activeFile!.write(entry, err => (err ? reject(err) : resolve()))
    })
    if (this.syncOnPut && this.activeFile) {
      fs.fsyncSync((this.activeFile as any).fd)
    }
    this.keydir.set(keyBuf.toString('binary'), {
      fileId: this.activeFileId,
      offset,
      size: entry.length,
      timestamp,
      tombstone: true,
    })
    this.activeOffset += entry.length
    if (this.activeOffset > 32 * 1024 * 1024) {
      this.activeFile!.close()
      this.rollover()
    }
  }

  listKeys(): string[] {
    return Array.from(this.keydir.entries()).filter(([_, v]) => !v.tombstone).map(([k, _]) => k)
  }

  async fold<T>(fn: (k: string, v: Buffer, acc: T) => T, acc0: T): Promise<T> {
    for (const [k, meta] of this.keydir.entries()) {
      if (!meta.tombstone) {
        const v = await this.get(k)
        acc0 = fn(k, v!, acc0)
      }
    }
    return acc0
  }

  async merge() {
    // Compact all but active file
    const live: Map<string, KeyDirEntry> = new Map()
    for (const [k, meta] of this.keydir.entries()) {
      if (!meta.tombstone) live.set(k, meta)
    }
    const fileIds = this.listDataFiles().map(f => parseInt(f.split('.')[0], 10))
    const nextId = fileIds.length ? Math.max(...fileIds) + 1 : 1
    const fname = `${nextId.toString().padStart(8, '0')}.data`
    const filePath = path.join(this.dirname, fname)
    const f = fs.createWriteStream(filePath, { flags: 'a' })
    for (const [k, meta] of live.entries()) {
      const v = await this.get(k)
      const keyBuf = Buffer.from(k, 'binary')
      const header = Buffer.alloc(ENTRY_HEADER_SIZE)
      header.writeUInt32BE(keyBuf.length, 0)
      header.writeUInt32BE(v!.length, 4)
      header.writeUInt8(0, 8)
      header.writeBigUInt64BE(meta.timestamp, 9)
      const entry = Buffer.concat([header, keyBuf, v!])
      await new Promise<void>((resolve, reject) => {
        f.write(entry, err => (err ? reject(err) : resolve()))
      })
    }
    f.close()
    for (const fid of fileIds) {
      if (fid !== this.activeFileId && fid !== nextId) {
        try {
          fs.unlinkSync(path.join(this.dirname, `${fid.toString().padStart(8, '0')}.data`))
        } catch { }
      }
    }
    this.loadFiles()
  }

  sync() {
    if (this.activeFile) fs.fsyncSync((this.activeFile as any).fd)
  }

  async close() {
    if (this.activeFile) this.activeFile.end()
    for (const fh of this.openFiles.values()) await fh.close()
    this.openFiles.clear()
  }
}

// API functions
export function open(dirname: string, opts?: { readWrite?: boolean; syncOnPut?: boolean }) {
  return new Bitcask(dirname, opts)
}
export async function get(handle: Bitcask, key: string | Buffer) {
  const v = await handle.get(key)
  return v === null ? 'not found' : v
}
export async function put(handle: Bitcask, key: string | Buffer, value: string | Buffer) {
  await handle.put(key, value)
  return 'ok'
}
export async function del(handle: Bitcask, key: string | Buffer) {
  await handle.delete(key)
  return 'ok'
}
export function listKeys(handle: Bitcask) {
  return handle.listKeys()
}
export async function fold<T>(handle: Bitcask, fn: (k: string, v: Buffer, acc: T) => T, acc0: T) {
  return await handle.fold(fn, acc0)
}
export async function merge(dirname: string) {
  const h = new Bitcask(dirname, { readWrite: true })
  await h.merge()
  h.close()
  return 'ok'
}
export function sync(handle: Bitcask) {
  handle.sync()
  return 'ok'
}
export async function close(handle: Bitcask) {
  await handle.close()
  return 'ok'
}
