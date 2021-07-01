/*
https://matthiashager.com/converting-snake-case-to-camel-case-object-keys-with-javascript

camelCase
snake_case
kebab-case
PascalCase // I won't be using this here, but it's only one small step further if you want to use it
*/

export const toCamelCase = (s: string) => {
  // if only capital letters, convert to lower case
  if (s.length > 0) {
    if (/^[A-Z0-9_\-\ ]*$/g.test(s)) {
      s = s.toLowerCase()
    }
    s = s
      // strip trailing non chars
      .replace(/^[-_\ ]+/gi, "")
      .replace(/[-_\ ]+$/gi, "")
      // strip separators and upper case first char
      .replace(/[-_\ ]+([a-z0-9])/gi, ($0, $1) => $1.toUpperCase())
    // lower case first char
    s = s[0].toLowerCase() + s.substring(1)
  }
  return s
}
