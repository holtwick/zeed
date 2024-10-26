import { Uint8ArrayToHexDump } from "./bin"
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
      if (typeof ErrorEvent !== 'undefined' && obj instanceof ErrorEvent) {
        obj = obj.error
      }
      if (obj instanceof Error) {
        if (!trace)
          return `${obj.name || 'Error'}: ${obj.message}`
        return `${obj.name || 'Error'}: ${obj.message}\n${obj.stack}`
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
  messages: any[],
  opt: RenderMessagesOptions = {},
): string {
  return formatMessages(messages, opt).join(' ')
}

