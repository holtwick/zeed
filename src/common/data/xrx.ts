/* eslint-disable no-cond-assign */

const RX_WHITESPACE = /\\\s|\s+|#[^\n]*\n?/g
const RX_REAL_GROUPS = /\(\?P?<(\w{2,})>|\((?!\?([:!=]|<=|<!))/g
// eslint-disable-next-line regexp/no-unused-capturing-group
const RX_LOOK_BEHIND = /^((?:\(\?[\w$]+\))?)\(\?<([=!])([\s\S]*?)\)/gm

export function regExpString(rx: string | RegExp): string {
  return typeof rx === 'string' ? rx : (rx.source || '')
}

export function regExpEscape(str: string): string {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export class XRX {
  lookBehind
  namedGroups: Record<string, number> = {}
  names: string[] = []
  rx: RegExp

  constructor(pattern: string | RegExp, flags?: string) {
    let _flags: string = flags ?? ''
    let _rx: string

    if (pattern instanceof RegExp) {
      if (flags == null)
        _flags = pattern.flags

      _rx = pattern.source
    }
    else {
      _rx = pattern
    }

    // eXtended / Ignore Whitespace
    const extended = _flags && _flags.includes('x')
    if (extended) {
      _flags = _flags.replace('x', '')
      _rx = _rx.replace(RX_WHITESPACE, (r) => {
        // log('rp', r)
        return r[0] === '\\' ? r : ''
      })
    }

    // Named Groups
    if (!(pattern instanceof RegExp)) {
      let index = 0
      _rx = _rx.replace(RX_REAL_GROUPS, (str, name) => {
        // log('>>>', name)
        index += 1
        if (name) {
          if (
            name !== 'index'
            && name !== 'length'
            && !this.namedGroups[name]
          ) {
            this.namedGroups[name] = index
          }
          // else
          //   log.error(`Unallowed or duplicate group name: ${name}`)

          return '('
        }
        return str
      })
      this.names = Object.keys(this.namedGroups)
    }

    // http://www.rexegg.com/regex-best-trick.html

    _rx = regExpString(_rx)
    RX_LOOK_BEHIND.lastIndex = 0
    const parts = RX_LOOK_BEHIND.exec(_rx)
    if (parts) {
      this.lookBehind = {
        rx: new RegExp(`${parts[3]}$(?!\\s)`),
        expect: parts ? parts[2] === '=' : !parts,
      }
      _rx = _rx.substr(parts[0].length)
    }

    this.rx = new RegExp(_rx, _flags)
  }

  // flagsString() {
  //     let hash = this.rx.toString() + '/'
  //     if (this.rx.global) {
  //         hash += 'g'
  //     }
  //     if (this.rx.multiline) {
  //         hash += 'm'
  //     }
  //     if (this.rx.ignoreCase) {
  //         hash += 'i'
  //     }
  //     if (this.rx.unicode) {
  //         hash += 'u'
  //     }
  //     if (this.rx.sticky) {
  //         hash += 'y'
  //     }
  // }

  get lastIndex(): number {
    return this.rx.lastIndex
  }

  set lastIndex(index: number) {
    this.rx.lastIndex = index
  }

  _handleMatch(m: any) {
    if (this.lookBehind) {
      const leftContext = m.input.slice(0, m.index)
      if (this.lookBehind.expect !== this.lookBehind.rx.test(leftContext))
        return null
    }
    for (const name of this.names)
      m[name] = m[this.namedGroups[name]]

    return m
  }

  exec(str: string) {
    let m
    while ((m = this.rx.exec(str))) {
      if (this.rx.lastIndex === m.index)
        this.rx.lastIndex++
      m = this._handleMatch(m)
      if (m != null)
        return m
    }
  }

  execAll(str: string) {
    const matches = []
    let m
    this.rx.lastIndex = 0
    while ((m = this.exec(str)))
      matches.push(m)

    this.rx.lastIndex = 0
    // log('execAll:', matches)
    return matches
  }

  replace(str: string, replacement: string | ((m: string) => string)) {
    const fn = typeof replacement === 'function' ? replacement : () => replacement
    return str.replace(this.rx, (m) => {
      // m = this._handleMatch(m)
      return fn(m)
    })
  }
}
