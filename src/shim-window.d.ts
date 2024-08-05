/* eslint-disable no-var */
/* eslint-disable vars-on-top */

export {}

declare global {
  interface Window {
    isNodeTestEnv?: boolean
  }

  namespace globalThis {
    var isNodeTestEnv: boolean
  }
}
