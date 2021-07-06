/**
 * Filter as described here https://github.com/visionmedia/debug#wildcards
 *
 * @param filter Namespace filter
 * @returns Function to check if filter applies
 */
export function useNamespaceFilter(filter?: string) {
  if (!filter) return (name: string) => false
  if (filter === "*") return (name: string) => true

  let reject = [] as RegExp[]
  let accept = [] as RegExp[]

  if (filter && filter !== "*") {
    let i
    const split = filter.split(/[\s,]+/)
    const len = split.length
    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue
      }
      filter = split[i].replace(/\*/g, ".*?")
      if (filter[0] === "-") {
        reject.push(new RegExp("^" + filter.substr(1) + "$"))
      } else {
        accept.push(new RegExp("^" + filter + "$"))
      }
    }
  }

  console.log(filter, accept, reject)

  return function (/* isAllowed */ name: string) {
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
