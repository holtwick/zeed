// Function

interface Type<T = unknown> {
  _value?: T
}

type Infer<T> = T extends Type<infer TT> ? TT : never

type TupleOutput<T extends Type[]> = {
  [K in keyof T]: T[K] extends Type<infer U> ? U : never;
}

type ArrayOutput<Head extends Type[], Rest extends Type | undefined> = [
  ...TupleOutput<Head>,
  ...(Rest extends Type ? Infer<Rest>[] : []),
]

type ArrayType<
  Head extends Type[] = Type[],
  Rest extends Type | undefined = Type | undefined,
> = Type<ArrayOutput<Head, Rest>>

function tuple<T extends [] | [Type, ...Type[]]>(items: T): ArrayType<T, undefined> {
  return {} as any
}

function string(): Type<string> {
  return {} as any
}

function boolean(): Type<boolean> {
  return {} as any
}

function number(): Type<number> {
  return {} as any
}

const tt = tuple([number(), string(), boolean()])
type ttt = Infer<typeof tt> // expected [number, string, boolean]
