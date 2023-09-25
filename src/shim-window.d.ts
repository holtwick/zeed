/* eslint-disable no-var */
/* eslint-disable vars-on-top */

export {}

declare global {
  interface Window {
    isNodeTestEnv?: boolean
  }

  module globalThis {
    var isNodeTestEnv: boolean
  }
}
