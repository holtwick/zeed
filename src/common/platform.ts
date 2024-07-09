/* eslint-disable no-restricted-globals */
/* eslint-disable node/prefer-global/process */

/**
 * Retrieves the global `window` object.
 * @returns The global `window` object if available, otherwise `undefined`.
 */
export function getWindow(): any | undefined {
  if (typeof window !== 'undefined')
    return window
}

/**
 * Retrieves the navigator object if it is available.
 * @returns The navigator object if available, otherwise undefined.
 */
export function getNavigator(): any | undefined {
  if (typeof navigator !== 'undefined')
    return navigator
}

/**
 * Retrieves the global object in the current environment.
 * @returns The global object.
 */
export function getGlobal(): any {
  return getWindow()
    // @ts-expect-error xxx
    ?? typeof WorkerGlobalScope !== 'undefined'
    ? self
    : typeof global !== 'undefined'
      ? global
      // eslint-disable-next-line no-new-func
      : Function('return this;')()
}

/** @deprecated */
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
  },
) {
  const _navigator = getNavigator()
  const _window = getWindow()

  info.ios = _navigator?.platform?.match(/(iPhone|iPod|iPad)/i) != null
  info.macos = !!_navigator?.platform?.startsWith('Mac')
  info.windows = !!_navigator?.platform?.startsWith('Win')

  info.beaker = _window?.beaker != null // https://github.com/beakerbrowser/beaker
  info.electron = (_navigator?.userAgent?.toLowerCase()?.indexOf(' electron/') || -1) > -1 && !info.beaker
  info.wkwebview = _window?.webkit?.messageHandlers != null // Apple embedded

  info.pwa = _navigator?.serviceWorker != null

  info.pwaInstalled = _navigator?.standalone || _window?.matchMedia?.('(display-mode: standalone)')?.matches

  info.node = typeof process !== 'undefined' && process?.release?.name === 'node'
  info.browser = !info.electron && !info.wkwebview && !info.node

  // info.worker = typeof importScripts === 'function'
  // @ts-expect-error xxx
  info.worker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
  // @ts-expect-error xxx

  info.jest = typeof jest !== 'undefined' || typeof vitest !== 'undefined' // || globalThis.__vitest_browser_runner__ != null || globalThis.__vitest_ui_api__ != null
  info.test = info.jest

  info.macosNative = info.wkwebview && info.macos
  info.iosNative = info.wkwebview && info.ios
  info.appleNative = info.wkwebview

  // https://github.com/viljamis/feature.js/blob/master/feature.js#L203
  // @ts-expect-error xxx
  info.touch = (_window && 'ontouchstart' in _window) || (_navigator?.maxTouchPoints || 0) > 1 || (_navigator?.msPointerEnabled && _window?.MSGesture) || (_window?.DocumentTouch && document instanceof DocumentTouch)

  return info
}

export function isBrowser() {
  return typeof window !== 'undefined' && globalThis === window
}

/**
 * Before closing the tab/window or quitting the node process
 * allow to do something important first
 */
export function useExitHandler(handler: () => void) {
  if (isBrowser())
    window.addEventListener('beforeunload', handler)
  else if (typeof process !== 'undefined')
    process.on('exit', () => handler)
}
