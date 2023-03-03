export {}

declare global {
  interface Window {
    isNodeTestEnv?: boolean
    // debugZeed?: boolean
  }

  module globalThis {
    var isNodeTestEnv: boolean
    // var debugZeed: boolean
  }
}
