#!/usr/bin/env bun

/* eslint-disable no-console */

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html

// try {
//   // @ts-expect-error just a polyfill
//   Symbol.dispose ??= Symbol("Symbol.dispose")
//   // @ts-expect-error just a polyfill
//   Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose")
// } finally { }

function useTempFile(path: string) {
  console.log('2 constructor')
  return {
    path,
    [Symbol.dispose]() {
      console.log('4 dispose')
    },
  }
}

function fn() {
  using f = useTempFile('abc')
  console.log('x using return:', f)
  console.log('3 fn return')
}

console.log('1 fn before')
fn()
console.log('5 fn after')
