import { decrypt, encrypt } from '../crypto'
import { Uint8ArrayToJson, jsonToUint8Array } from '../data/bin'

export interface Encoder {
  encode: (data: any) => Promise<Uint8Array>
  decode: (data: Uint8Array) => Promise<any>
}

export class NoopEncoder implements Encoder {
  async encode(data: any): Promise<Uint8Array> {
    return data
  }

  async decode(data: Uint8Array): Promise<any> {
    return data
  }
}

export class JsonEncoder implements Encoder {
  async encode(data: any): Promise<Uint8Array> {
    return jsonToUint8Array(data)
  }

  async decode(data: Uint8Array): Promise<any> {
    return Uint8ArrayToJson(data)
  }
}

export class CryptoEncoder implements Encoder {
  key: CryptoKey

  constructor(key: CryptoKey) {
    this.key = key
  }

  async encode(data: any): Promise<Uint8Array> {
    const plain = jsonToUint8Array(data)
    return await encrypt(plain, this.key)
  }

  async decode(data: Uint8Array): Promise<any> {
    const plain = await decrypt(data, this.key)
    return Uint8ArrayToJson(plain)
  }
}
