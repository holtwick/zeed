// Simple demo for node and CommonJS loading

/* eslint-disable no-console */

import { arrayUnion } from 'zeed'
import { b } from './lib'

function dummy() {
  console.log('dummy')
}

let a = [1,2,3,3]
let aa = arrayUnion(a)

console.log(aa)

b()

