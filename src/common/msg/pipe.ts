// Experiment to replace "Channel" by "Pipe".
// Different naming just to avoid confusion.
// Goal: Simplify things by removing event handling etc.

export interface Pipe<PipeObjectData = object, PipeRawData = PipeObjectData> {
  /** Function to post raw message */
  post: (data: PipeObjectData) => Promise<void> | void

  /** Listener to receive raw message */
  on: (fn: (data: PipeObjectData) => Promise<void> | void) => void

  /** Custom function to serialize data */
  serialize?: (data: PipeObjectData) => Promise<PipeRawData> | PipeRawData

  /** Custom function to deserialize data */
  deserialize?: (data: PipeRawData) => Promise<PipeObjectData> | PipeObjectData
}

// export interface Pipe<PipeObjectData = object, PipeRawData = PipeObjectData> {
//   /** Function to post raw message */
//   post: (data: PipeObjectData) => void

//   /** Listener to receive raw message */
//   on: (fn: (data: PipeObjectData) => void) => void

//   /** Custom function to serialize data */
//   serialize?: (data: PipeObjectData) => PipeRawData

//   /** Custom function to deserialize data */
//   deserialize?: (data: PipeRawData) => PipeObjectData
// }

// describe('types.spec', () => {
//   it.skip('should pipe', async () => {
//     const p1: Pipe<object, string> = {
//       post(s) { }, // todo
//       on: (fn) => { }, // todo
//       serialize(o) {
//         return JSON.stringify(o)
//       },
//       deserialize(s) {
//         return JSON.parse(s)
//       },
//     }

//     async function echo(pipe: Pipe<any, any>, o: object) {
//       let resolve: any
//       pipe.on(fn => resolve = fn)
//       pipe.post(o)
//       return new Promise(resolve)
//     }

//     const x = await echo(p1, { a: 1 })
//     expect(x).toMatchInlineSnapshot()
//   })
// })
