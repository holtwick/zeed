import { setDayTest } from './data'
import { setTimestampTest } from './time'
import { setUuidDefaultEncoding } from './uuid'

export function setTestMode() {
  setUuidDefaultEncoding('test')
  setTimestampTest()
  setDayTest()
}
