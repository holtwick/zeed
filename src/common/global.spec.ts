import { getGlobalContext } from './global'

declare global {
  interface ZeedGlobalContext {
    test?: number
  }
}

describe('global', () => {
  it('should remeber global', async () => {
    getGlobalContext().test = 0
    getGlobalContext().test = 123
    expect(getGlobalContext().test).toBe(123)
  })
})
