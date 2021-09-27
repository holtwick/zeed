// import { Json } from "../types"

export interface Encoder {
  encode(data: any): Promise<Uint8Array>
  decode(data: Uint8Array): Promise<any>
}

export class JsonEncoder implements Encoder {
  async encode(data: any): Promise<Uint8Array> {
    return JSON.stringify(data) as any
  }

  async decode(data: Uint8Array): Promise<any> {
    return JSON.parse(data as any)
  }
}
