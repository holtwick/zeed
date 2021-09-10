import { dirname } from "path"
import { fileURLToPath } from "url"

// From https://antfu.me/notes#isomorphic-dirname
export const _dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url))
