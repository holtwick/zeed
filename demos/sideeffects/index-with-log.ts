import type { LoggerInterface } from 'zeed'
import { Logger, arrayUnion } from 'zeed'

const log: LoggerInterface = Logger('test')

const a = [1, 2, 3, 3]
const aa = arrayUnion(a)

log('result arrayUnion', aa)

// console.log(encodeBase32('abc'))
