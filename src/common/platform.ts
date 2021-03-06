// (C)opyright 2021-07-15 Dirk Holtwick, holtwick.it. All rights reserved.

export function getWindow(): any | undefined {
  // @ts-ignore
  if (typeof window !== "undefined") return window
}

export function getNavigator(): any | undefined {
  // @ts-ignore
  if (typeof navigator !== "undefined") return navigator
}

export function getGlobal(): any {
  return getWindow() ??
    // @ts-ignore
    typeof WorkerGlobalScope !== "undefined"
    ? // @ts-ignore
      self
    : typeof global !== "undefined"
    ? global
    : Function("return this;")()
}

// todo sideffects
const _navigator = getNavigator()
const _window = getWindow()

export function detect(
  info = {
    ios: false,
    macos: false,
    windows: false,
    beaker: false,
    electron: false,
    wkwebview: false,
    pwa: false,
    pwaInstalled: false,
    browser: false,
    node: false,
    worker: false,
    test: false,
    jest: false,
    macosNative: false,
    iosNative: false,
    appleNative: false,
    touch: false,
  }
) {
  info.ios = _navigator?.platform?.match(/(iPhone|iPod|iPad)/i) != null
  info.macos = !!_navigator?.platform?.startsWith("Mac")
  info.windows = !!_navigator?.platform?.startsWith("Win")

  // @ts-ignore
  info.beaker = _window?.["beaker"] != null // https://github.com/beakerbrowser/beaker
  info.electron =
    (_navigator?.userAgent?.toLowerCase()?.indexOf(" electron/") || -1) > -1 &&
    !info.beaker
  // @ts-ignore
  info.wkwebview = _window?.webkit?.["messageHandlers"] != null //Apple embedded

  info.pwa = _navigator?.serviceWorker != null

  info.pwaInstalled =
    // @ts-ignore
    _navigator?.standalone ||
    _window?.matchMedia?.("(display-mode: standalone)")?.matches

  info.node =
    typeof process !== "undefined" && process?.release?.name === "node"
  info.browser = !info.electron && !info.wkwebview && !info.node

  // info.worker = typeof importScripts === 'function'
  // @ts-ignore
  info.worker =
    // @ts-ignore
    typeof WorkerGlobalScope !== "undefined" &&
    // @ts-ignore
    self instanceof WorkerGlobalScope
  // @ts-ignore
  info.jest = typeof jest !== "undefined" || typeof vitest !== "undefined"
  info.test = info.jest

  info.macosNative = info.wkwebview && info.macos
  info.iosNative = info.wkwebview && info.ios
  info.appleNative = info.wkwebview

  // https://github.com/viljamis/feature.js/blob/master/feature.js#L203
  // @ts-ignore
  info.touch =
    (_window && "ontouchstart" in _window) ||
    (_navigator?.maxTouchPoints || 0) > 1 ||
    // @ts-ignore
    (_navigator?.msPointerEnabled && _window?.MSGesture) ||
    // @ts-ignore
    (_window?.DocumentTouch && document instanceof DocumentTouch)

  return info
}

// https://stackoverflow.com/a/31090240/140927
// export const isBrowser = new Function(
//   "try {return this===window;}catch(e){ return false;}"
// )

// export const isNode = new Function(
//   "try {return this===global;}catch(e){return false;}"
// )

export const isBrowser = () =>
  typeof window !== "undefined" && globalThis === window

export const platform = detect()

/**
 * Before closing the tab/window or quitting the node process
 * allow to do something important first
 */
export function useExitHandler(handler: () => void) {
  if (isBrowser()) {
    window.addEventListener("beforeunload", handler)
  } else if (typeof process !== "undefined") {
    process.on("exit", () => handler)
  }
}
