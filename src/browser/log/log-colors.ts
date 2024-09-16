/* eslint-disable node/prefer-global/process */

// Taken from https://github.com/visionmedia/debug/blob/master/src/browser.js#L27

export function browserSupportsColors(): boolean {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (
    typeof window !== 'undefined'
    && window.process
    // @ts-expect-error xxx
    && (window.process.type === 'renderer' || window.process.__nwjs)
  ) {
    return true
  }

  // Internet Explorer and Edge do not support colors.
  if (
    typeof navigator !== 'undefined'
    && navigator.userAgent
    && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)
  ) {
    return false
  }

  // Is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (
    (typeof document !== 'undefined'
      && document.documentElement
      && document.documentElement.style
    // @ts-expect-error xxx
      && document.documentElement.style.WebkitAppearance)
    // Is firebug? http://stackoverflow.com/a/398120/376773
      || (typeof window !== 'undefined'
        && window.console
      // @ts-expect-error xxx
        && (window.console.firebug
        // @ts-expect-error xxx

          || (window.console.exception && window.console.table)))
    // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
          || (typeof navigator !== 'undefined'
            && navigator.userAgent
            && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)
          // eslint-disable-next-line regexp/no-legacy-features
            && Number.parseInt(RegExp.$1, 10) >= 31)
    // Double check webkit in userAgent just in case we are in a worker
            || (typeof navigator !== 'undefined'
              && navigator.userAgent
              && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/))
  )
}
