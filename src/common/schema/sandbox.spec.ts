/* eslint-disable ts/no-unsafe-declaration-merging */
// // Define an interface for the instance type
// interface MyTypeInstance {
//   value: number
//   test: () => number
// }

// // Constructor function
// function MyType(this: MyTypeInstance, value: number) {
//   this.value = value
// }

// MyType.prototype.test = function () {
//   return this.value
// }

class MyType {
  value: number
  constructor(value: number) {
    this.value = value
  }
}

interface MyType {
  test: () => number
}

describe('sandbox.spec', () => {
  it('should do something', async () => {
    // Create an instance of MyType using the 'new' keyword
    const my = new MyType(123)

    MyType.prototype.test = function () {
      return this.value + 1
    }

    // Example usage
    expect(my.test()).toMatchInlineSnapshot(`124`)
    expect(my).toMatchInlineSnapshot(`
      MyType {
        "value": 123,
      }
    `)
  })
})
