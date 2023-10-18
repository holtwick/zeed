// Experiment to replace "Channel" by "Pipe".
// Different naming just to avoid confusion.
// Goal: Simplify things by removing event handling etc.

export interface Pipe<PipeObjectData = object, PipeRawData = PipeObjectData> {
  /** Function to post raw message */
  post: (data: PipeObjectData) => void

  /** Listener to receive raw message */
  on: (fn: (data: PipeObjectData) => void) => void

  /** Custom function to serialize data */
  serialize?: (data: PipeObjectData) => PipeRawData

  /** Custom function to deserialize data */
  deserialize?: (data: PipeRawData) => PipeObjectData
}

export interface PipeAsync<PipeObjectData = object, PipeRawData = PipeObjectData> {
  /** Function to post raw message */
  post: (data: PipeObjectData) => Promise<void>

  /** Listener to receive raw message */
  on: (fn: (data: PipeObjectData) => Promise<void>) => void

  /** Custom function to serialize data */
  serialize?: (data: PipeObjectData) => Promise<PipeRawData>

  /** Custom function to deserialize data */
  deserialize?: (data: PipeRawData) => Promise<PipeObjectData>
}
