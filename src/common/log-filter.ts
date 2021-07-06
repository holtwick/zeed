interface NamespaceFilter {
  (name: string): boolean
  accept: RegExp[]
  reject: RegExp[]
  filter: string
}

/**
 * Filter as described here https://github.com/visionmedia/debug#wildcards
 *
 * @param filter Namespace filter
 * @returns Function to check if filter applies
 */
export function useNamespaceFilter(filter?: string): NamespaceFilter {
  let fn: any // (name: string) => boolean
  let reject = [] as RegExp[]
  let accept = [] as RegExp[]

  if (!filter) {
    fn = function (name: string) {
      return false
    }
  } else if (filter === "*") {
    fn = function (name: string) {
      return true
    }
  } else {
    let i
    const split = filter.split(/[\s,]+/)
    const len = split.length
    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue
      }
      let template = split[i].replace(/\*/g, ".*?")
      if (template[0] === "-") {
        reject.push(new RegExp("^" + template.substr(1) + "$"))
      } else {
        accept.push(new RegExp("^" + template + "$"))
      }
    }

    fn = function (name: string) {
      if (reject.length === 0 && accept.length === 0) {
        return true
      }
      let i, len
      for (i = 0, len = reject.length; i < len; i++) {
        if (reject[i].test(name)) {
          return false
        }
      }
      for (i = 0, len = accept.length; i < len; i++) {
        if (accept[i].test(name)) {
          return true
        }
      }
      return false
    }
  }
  fn.accept = accept
  fn.reject = reject
  fn.filter = filter
  return fn as NamespaceFilter
}
