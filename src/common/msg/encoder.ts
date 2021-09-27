// import { Json } from "../types"

export interface Encoder {
  encode(data: any): Promise<ArrayBuffer>
  decode(data: ArrayBuffer): Promise<any>
}

export class JsonEncoder implements Encoder {
  async encode(data: any): Promise<ArrayBuffer> {
    return JSON.stringify(data) as any
  }

  async decode(data: ArrayBuffer): Promise<any> {
    return JSON.parse(data as any)
  }
}
