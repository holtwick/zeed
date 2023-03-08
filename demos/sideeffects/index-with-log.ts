/* eslint-disable no-console */

import { arrayUnion, Logger, LoggerInterface } from 'zeed'

const log: LoggerInterface = Logger("test")

let a = [1,2,3,3]
let aa = arrayUnion(a)

log('result arrayUnion', aa)

// console.log(encodeBase32('abc'))
