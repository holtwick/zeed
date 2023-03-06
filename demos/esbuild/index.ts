/* eslint-disable no-console */

import { arrayUnion, encodeBase32 } from 'zeed'

let a = [1,2,3,3]
let aa = arrayUnion(a)
console.log(aa)

console.log(encodeBase32('abc'))
