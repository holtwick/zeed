#!/usr/bin/env bun

/* eslint-disable no-console */

class TempFile implements Disposable {
  constructor(path: string) {
    console.log('2 constructor')
  }

  [Symbol.dispose]() {
    console.log('4 dispose')
  }
}

function fn() {
  using f = new TempFile('abc')
  console.log('3 fn return')
}

console.log('1 fn before')
fn()
console.log('5 fn after')
