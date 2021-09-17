import { Json } from "../types"

export interface Encoder {
  encode(data: Json): ArrayBuffer
  decode(data: ArrayBuffer): Json
}

export class JsonEncoder implements Encoder {
  encode(data: Json): ArrayBuffer {
    return JSON.stringify(data) as any
  }

  decode(data: ArrayBuffer): Json {
    return JSON.parse(data as any) as any
  }
}
