import { Json } from "../types"

export class JsonEncoder {
  encode(data: Json): string {
    return JSON.stringify(data)
  }

  decode(data: any): Json {
    return JSON.parse(data)
  }
}
