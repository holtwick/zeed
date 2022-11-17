// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from '../common/log'

const { error } = Logger('zeed:base64', 'error')

export function urlBase64ToUint8Array(
  base64String: string,
): Uint8Array | undefined {
  try {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i)
      outputArray[i] = rawData.charCodeAt(i)

    return outputArray
  }
  catch (err) {
    error(err, base64String)
  }
}
