// Typescript type testing written with some help from AI :)

export type Expect<T extends true> = T

export type IsEqual<X, Y>
  = (<T>() => T extends X ? true : false) extends
  (<T>() => T extends Y ? true : false) ? true : false

// Example type to test
// interface MyType { name: string, age: number }

// Test cases
// type Test1 = Expect<IsEqual<MyType, { name: string, age: number }>> // Should pass
// type Test2 = Expect<IsEqual<MyType, { name: string }>> // Should fail
