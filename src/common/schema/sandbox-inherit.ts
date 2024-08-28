class TypeClass<T = unknown> {
  optional(): TypeClass<T | undefined> {
    return this
  }
}

class TypeStringClass<T extends string> extends TypeClass<T> {

}

const o = new TypeStringClass()
const v = o.optional()
type t = typeof v // expect: TypeStringClass<string | undefined>
