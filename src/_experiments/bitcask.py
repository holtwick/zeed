"""
Bitcask-inspired key-value store (minimal, single-process, single-writer)
Copyright 2024
"""
import os
import struct
import threading

MAGIC = b'BCSK'  # file magic
ENTRY_HEADER = '>IIBQ'  # key_size, value_size, tombstone, timestamp
ENTRY_HEADER_SIZE = struct.calcsize(ENTRY_HEADER)

class Bitcask:
    def __init__(self, dirname, read_write=True, sync_on_put=False):
        self.dirname = dirname
        self.read_write = read_write
        self.sync_on_put = sync_on_put
        self.lock = threading.Lock()
        os.makedirs(dirname, exist_ok=True)
        self.keydir = {}  # key: (fileid, offset, size, timestamp, tombstone)
        self.active_file = None
        self.active_fileid = None
        self.active_offset = 0
        self._open_files = {}
        self._load_files()
        if read_write:
            self._rollover()

    def _list_datafiles(self):
        return sorted([f for f in os.listdir(self.dirname) if f.endswith('.data')])

    def _load_files(self):
        # Scan all data files to build keydir
        for fname in self._list_datafiles():
            fileid = int(fname.split('.')[0])
            path = os.path.join(self.dirname, fname)
            with open(path, 'rb') as f:
                offset = 0
                while True:
                    header = f.read(ENTRY_HEADER_SIZE)
                    if not header or len(header) < ENTRY_HEADER_SIZE:
                        break
                    key_size, value_size, tombstone, timestamp = struct.unpack(ENTRY_HEADER, header)
                    key = f.read(key_size)
                    if len(key) < key_size:
                        break
                    if tombstone:
                        value = None
                        f.seek(value_size, 1)
                    else:
                        value = None
                        f.seek(value_size, 1)
                    self.keydir[key] = (fileid, offset, ENTRY_HEADER_SIZE + key_size + value_size, timestamp, tombstone)
                    offset += ENTRY_HEADER_SIZE + key_size + value_size

    def _rollover(self):
        # Create new active file
        fileids = [int(f.split('.')[0]) for f in self._list_datafiles()]
        nextid = max(fileids) + 1 if fileids else 1
        fname = f'{nextid:08d}.data'
        path = os.path.join(self.dirname, fname)
        self.active_file = open(path, 'ab+')
        self.active_fileid = nextid
        self.active_offset = self.active_file.tell()
        self._open_files[nextid] = self.active_file

    def put(self, key, value):
        assert self.read_write, 'Read-only mode'
        with self.lock:
            timestamp = int.from_bytes(os.urandom(4), 'big')
            tombstone = 0
            key_bytes = key if isinstance(key, bytes) else key.encode()
            value_bytes = value if isinstance(value, bytes) else value.encode()
            entry = struct.pack(ENTRY_HEADER, len(key_bytes), len(value_bytes), tombstone, timestamp)
            entry += key_bytes + value_bytes
            offset = self.active_file.tell()
            self.active_file.write(entry)
            if self.sync_on_put:
                self.active_file.flush()
                os.fsync(self.active_file.fileno())
            self.keydir[key_bytes] = (self.active_fileid, offset, len(entry), timestamp, tombstone)
            self.active_offset += len(entry)
            if self.active_offset > 32 * 1024 * 1024:  # 32MB
                self.active_file.close()
                self._rollover()

    def get(self, key):
        key_bytes = key if isinstance(key, bytes) else key.encode()
        meta = self.keydir.get(key_bytes)
        if not meta or meta[4]:
            return None
        fileid, offset, size, timestamp, tombstone = meta
        f = self._open_files.get(fileid)
        if not f:
            fname = os.path.join(self.dirname, f'{fileid:08d}.data')
            f = open(fname, 'rb')
            self._open_files[fileid] = f
        f.seek(offset)
        header = f.read(ENTRY_HEADER_SIZE)
        key_size, value_size, tombstone, timestamp = struct.unpack(ENTRY_HEADER, header)
        f.read(key_size)
        value = f.read(value_size)
        return value

    def delete(self, key):
        assert self.read_write, 'Read-only mode'
        with self.lock:
            timestamp = int.from_bytes(os.urandom(4), 'big')
            tombstone = 1
            key_bytes = key if isinstance(key, bytes) else key.encode()
            entry = struct.pack(ENTRY_HEADER, len(key_bytes), 0, tombstone, timestamp)
            entry += key_bytes
            offset = self.active_file.tell()
            self.active_file.write(entry)
            if self.sync_on_put:
                self.active_file.flush()
                os.fsync(self.active_file.fileno())
            self.keydir[key_bytes] = (self.active_fileid, offset, len(entry), timestamp, tombstone)
            self.active_offset += len(entry)
            if self.active_offset > 32 * 1024 * 1024:
                self.active_file.close()
                self._rollover()

    def list_keys(self):
        return [k for k, v in self.keydir.items() if not v[4]]

    def fold(self, fun, acc0):
        for k, v in self.keydir.items():
            if not v[4]:
                val = self.get(k)
                acc0 = fun(k, val, acc0)
        return acc0

    def merge(self):
        # Compact all but active file
        with self.lock:
            live = {}
            for k, meta in self.keydir.items():
                if not meta[4]:
                    live[k] = meta
            # Write to new file
            fileids = [int(f.split('.')[0]) for f in self._list_datafiles()]
            nextid = max(fileids) + 1 if fileids else 1
            fname = f'{nextid:08d}.data'
            path = os.path.join(self.dirname, fname)
            with open(path, 'ab+') as f:
                for k, meta in live.items():
                    v = self.get(k)
                    timestamp = meta[3]
                    entry = struct.pack(ENTRY_HEADER, len(k), len(v), 0, timestamp)
                    entry += k + v
                    f.write(entry)
            # Remove old files (except new and active)
            for fid in fileids:
                if fid != self.active_fileid and fid != nextid:
                    try:
                        os.remove(os.path.join(self.dirname, f'{fid:08d}.data'))
                    except Exception:
                        pass
            self._load_files()

    def sync(self):
        if self.active_file:
            self.active_file.flush()
            os.fsync(self.active_file.fileno())

    def close(self):
        if self.active_file:
            self.active_file.close()
        for f in self._open_files.values():
            try:
                f.close()
            except Exception:
                pass
        self._open_files = {}

# API functions

def open(dirname, opts=None):
    opts = opts or {}
    return Bitcask(dirname, read_write=opts.get('read_write', True), sync_on_put=opts.get('sync_on_put', False))

def get(handle, key):
    v = handle.get(key)
    return v if v is not None else 'not found'

def put(handle, key, value):
    handle.put(key, value)
    return 'ok'

def delete(handle, key):
    handle.delete(key)
    return 'ok'

def list_keys(handle):
    return handle.list_keys()

def fold(handle, fun, acc0):
    return handle.fold(fun, acc0)

def merge(dirname):
    h = Bitcask(dirname, read_write=True)
    h.merge()
    h.close()
    return 'ok'

def sync(handle):
    handle.sync()
    return 'ok'

def close(handle):
    handle.close()
    return 'ok'
