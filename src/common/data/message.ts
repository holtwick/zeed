import { Uint8ArrayToHexDump } from "./bin"
import { isArray } from "./is"
import { objectPlain } from "./object"

export interface RenderMessagesOptions {
  trace?: boolean // = true
  pretty?: boolean // = true
}

export function formatMessages(
  messages: any[],
  opt: RenderMessagesOptions = {},
): any[] {
  const { trace = true, pretty = true } = opt
  return messages.map((obj) => {
    if (obj && typeof obj === 'object') {
      if (pretty && (obj instanceof Uint8Array || obj instanceof ArrayBuffer))
        return `\n${Uint8ArrayToHexDump(obj)}\n`
      
      if (obj instanceof Error) {
        return `${obj.name}: ${obj.message}` + (trace ? `\n${obj.stack}` : '')
      }
      if (typeof ErrorEvent !== 'undefined' && obj instanceof ErrorEvent) {
        return `${obj.error.name || 'ErrorEvent'}: ${obj.error.message}` + (trace ? `\n${obj.error.stack}` : '')
      }
      if (typeof DOMException !== 'undefined' && obj instanceof DOMException) {
        return `${obj.name || 'DOMException'}: ${obj.message}` + (trace ? `\n${obj.stack}` : '')
      }
      if (obj && typeof obj === 'object' && 'reason' in obj) {
        return `PromiseRejection ${obj.type}: ${obj.reason}` + (trace ? `\n${obj.stack}` : '')
      }
      
      try {
        obj = objectPlain(obj)
        return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj)
      }
      catch (err) {}
    }
    return String(obj)
  })
}

export function renderMessages(
  messages: any | any[],
  opt: RenderMessagesOptions = {},
): string {
  return formatMessages(isArray(messages) ?  messages : [messages], opt).join(' ')
}
